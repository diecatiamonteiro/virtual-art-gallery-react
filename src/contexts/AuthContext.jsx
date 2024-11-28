// Main authentication context that manages:
// - User authentication state
// - User roles (artist/art lover)
// - Guest access
// - Role-based permissions
// - User profile data in Firestore

// Allows users to be both artists and art lovers
// Makes the transition from art lover to artist seamless
// Art lovers can become artists later through becomeArtist()
// All users can purchase artwork
// Maintains separate artist-specific fields (more flexible role checking with hasRole())
// Tracks whether an artist has completed their profile
// Unified signup process with role selection
// Keeps analytics for all user actions

import { createContext, useContext, useEffect, useState } from "react";
import { auth, db, storage } from "../config/firebase";
import {
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
signOut,
onAuthStateChanged,
updatePassword,
deleteUser,
EmailAuthProvider,
reauthenticateWithCredential
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { uploadBytes, getDownloadURL, ref } from "firebase/storage";
import { toast } from 'react-hot-toast';

// Create a context to share auth state across the app
const AuthContext = createContext();

// Custom hook for easy access to auth context
export function useAuth() {
return useContext(AuthContext);
}

export function AuthProvider({ children }) {
const [currentUser, setCurrentUser] = useState(null);
const [loading, setLoading] = useState(true);

// Add cart state with localStorage initialization
const [cart, setCart] = useState(() => {
// Check localStorage for existing guest cart on initial load
const savedCart = localStorage.getItem('guestCart');
return savedCart ? JSON.parse(savedCart) : [];
});

// Add to cart function that works for both guests and logged-in users
const addToCart = async (artwork) => {
try {
// Check if item is already in cart
const existingItemIndex = cart.findIndex(item => item.id === artwork.id);
let updatedCart;

if (existingItemIndex !== -1) {
// If item exists, increment quantity
updatedCart = cart.map((item, index) => {
if (index === existingItemIndex) {
return {
...item,
quantity: (item.quantity || 1) + 1
};
}
return item;
});
toast.success('Added another to cart');
} else {
// If item is new, add it with quantity 1
updatedCart = [...cart, { ...artwork, quantity: 1 }];
toast.success('Added to cart');
}

if (currentUser) {
// If user is logged in, save cart to Firebase
const userRef = doc(db, "users", currentUser.uid);
await updateDoc(userRef, { cart: updatedCart });
} else {
// If guest, save cart to localStorage
localStorage.setItem('guestCart', JSON.stringify(updatedCart));
}
setCart(updatedCart);
return true;
} catch (error) {
console.error('Error adding to cart:', error);
toast.error('Failed to add to cart');
return false;
}
};

// Add new function to update quantity
const updateCartItemQuantity = async (artworkId, newQuantity) => {
try {
if (newQuantity < 1) {
return removeFromCart(artworkId);
}

const updatedCart = cart.map(item => {
if (item.id === artworkId) {
return { ...item, quantity: newQuantity };
}
return item;
});

if (currentUser) {
const userRef = doc(db, "users", currentUser.uid);
await updateDoc(userRef, { cart: updatedCart });
} else {
localStorage.setItem('guestCart', JSON.stringify(updatedCart));
}
setCart(updatedCart);
} catch (error) {
toast.error('Failed to update quantity');
}
};

// Remove from cart function
const removeFromCart = async (artworkId) => {
try {
const updatedCart = cart.filter(item => item.id !== artworkId);
if (currentUser) {
// Update Firebase if user is logged in
const userRef = doc(db, "users", currentUser.uid);
await updateDoc(userRef, { cart: updatedCart });
} else {
// Update localStorage if guest
localStorage.setItem('guestCart', JSON.stringify(updatedCart));
}
setCart(updatedCart);
toast.success('Removed from cart');
} catch (error) {
toast.error('Failed to remove from cart');
}
};

// Function to merge guest cart with user cart upon login
const mergeGuestCart = async (user) => {
const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
if (guestCart.length > 0) {
// Get user's existing cart from Firebase
const userRef = doc(db, "users", user.uid);
const userDoc = await getDoc(userRef);
const userData = userDoc.data();
const userCart = userData.cart || [];
// Merge carts, avoiding duplicates
const mergedCart = [...userCart];
guestCart.forEach(item => {
if (!mergedCart.some(userItem => userItem.id === item.id)) {
mergedCart.push(item);
}
});
// Save merged cart to Firebase and clear localStorage
await updateDoc(userRef, { cart: mergedCart });
setCart(mergedCart);
localStorage.removeItem('guestCart');
}
};

// Create new user account and profile
async function signup(email, password, firstName, lastName, isArtist = false) {
try {
// Create auth account in Firebase
const userCredential = await createUserWithEmailAndPassword(
auth,
email,
password
);

// Create user profile document in Firestore database
const userData = {
email,
firstName,
lastName,
isArtist,
createdAt: new Date().toISOString(),
// Common fields
favorites: [], // Saved artwork
purchases: [], // Purchased artwork
// Artist specific fields
artworks: isArtist ? [] : null,
sales: isArtist ? [] : null,
artistProfile: isArtist ? {
bio: '',
statement: '',
isComplete: false
} : null
};

await setDoc(doc(db, "users", userCredential.user.uid), userData);
setCurrentUser({ ...userCredential.user, ...userData });
return userCredential;
} catch (error) {
throw error;
}
}

// Log in existing user
async function login(email, password) {
try {
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
const userData = userDoc.data();
// Make sure we have the userData before setting currentUser
if (userDoc.exists()) {
const fullUserData = { ...userCredential.user, ...userData };
setCurrentUser(fullUserData);
return { user: userCredential.user, userData };
} else {
throw new Error("User data not found");
}
} catch (error) {
console.error("Login error:", error);
throw error;
}
}

// Log out current user
async function logout() {
try {
await signOut(auth);
setCurrentUser(null);
} catch (error) {
throw error;
}
}

// Enable browsing without account
function continueAsGuest() {
setCurrentUser({ isGuest: true });
}

// Helper functions to check user permissions

const isArtist = () => {
if (!currentUser) return false;
return currentUser.isArtist === true;
};
const canBuyArt = () => currentUser && !currentUser.isGuest;

// Listen for authentication state changes
useEffect(() => {
// Subscribe to Firebase auth state
const unsubscribe = onAuthStateChanged(auth, async (user) => {
if (user) {
try {
const userDoc = await getDoc(doc(db, "users", user.uid));
if (userDoc.exists()) {
setCurrentUser({ ...user, ...userDoc.data() });
}
} catch (error) {
console.error("Error fetching user document:", error);
setCurrentUser(user);
}
} else {
setCurrentUser(null);
}
// Mark initial loading as complete
setLoading(false);
});

// Cleanup subscription when component unmounts
return unsubscribe;
}, []);

// Toggle favorite artwork
async function toggleFavorite(artworkData) {
if (!currentUser || currentUser.isGuest) {
throw new Error("Please sign in to save favourites");
}

const userRef = doc(db, "users", currentUser.uid);
const userDoc = await getDoc(userRef);
const userData = userDoc.data();
// Check if artwork is already in favorites
const existingFavorites = userData.favorites || [];
const isAlreadyFavorite = existingFavorites.some(fav => fav.id === artworkData.id);
let updatedFavorites;
if (isAlreadyFavorite) {
// Remove from favorites
updatedFavorites = existingFavorites.filter(fav => fav.id !== artworkData.id);
} else {
// Add to favorites
updatedFavorites = [...existingFavorites, {
id: artworkData.id,
title: artworkData.alt_description,
imageUrl: artworkData.urls.regular,
artist: artworkData.user.name,
price: artworkData.price,
size: artworkData.size,
addedAt: new Date().toISOString()
}];
}

// Update Firestore and local state
await setDoc(userRef, { favorites: updatedFavorites }, { merge: true });
setCurrentUser(prev => ({
...prev,
favorites: updatedFavorites
}));

return !isAlreadyFavorite; // returns true if added, false if removed
}

// Check if artwork is favorited
function isArtworkFavorited(artworkId) {
if (!currentUser || !currentUser.favorites) return false;
return currentUser.favorites.some(fav => fav.id === artworkId);
}

// Add to useEffect that handles auth state
useEffect(() => {
// Check if cart in localStorage matches state
const savedCart = localStorage.getItem('guestCart');
const parsedCart = savedCart ? JSON.parse(savedCart) : [];
if (!currentUser && JSON.stringify(parsedCart) !== JSON.stringify(cart)) {
setCart(parsedCart);
}
}, [currentUser]);

// Function to clear cart
const clearCart = async () => {
try {
if (currentUser) {
const userRef = doc(db, "users", currentUser.uid);
await updateDoc(userRef, { cart: [] });
}
setCart([]);
localStorage.removeItem('guestCart');
} catch (error) {
console.error('Error clearing cart:', error);
}
};

// Calculate total price of items in cart
const calculateTotal = () => {
return cart.reduce((total, item) => 
total + (item.price * (item.quantity || 1)), 0
);
};

// Update user profile
const updateProfile = async (profileData, updateType = 'profile') => {
try {
if (!currentUser?.uid) {
throw new Error("No user logged in");
}

const userRef = doc(db, "users", currentUser.uid);
// Handle different types of updates
let updateData = {};
if (updateType === 'bio') {
// Only update bio field
updateData = {
bio: profileData.bio
};
} else {
// Regular profile update
updateData = {
firstName: profileData.firstName,
lastName: profileData.lastName,
location: profileData.location,
...(profileData.photoPreview && { profilePhoto: profileData.photoPreview })
};
}

// Update Firestore
await updateDoc(userRef, updateData);

// Update local state
setCurrentUser(prev => ({
...prev,
...updateData
}));

// Get fresh user data after update
const userDoc = await getDoc(userRef);
if (userDoc.exists()) {
setCurrentUser(prev => ({
...prev,
...userDoc.data()
}));
}

return true;
} catch (error) {
console.error('Error updating profile:', error);
throw error;
}
};

// Update user password
const updateUserPassword = async (currentPassword, newPassword) => {
try {
if (!auth.currentUser) {
throw new Error("No user is currently signed in");
}

// Create credentials with current password
const credential = EmailAuthProvider.credential(
auth.currentUser.email,
currentPassword
);

// Reauthenticate
await reauthenticateWithCredential(auth.currentUser, credential);
// Now update password
await updatePassword(auth.currentUser, newPassword);
toast.success('Password updated successfully');
} catch (error) {
console.error('Error updating password:', error);
if (error.code === 'auth/wrong-password') {
toast.error('Current password is incorrect');
} else {
toast.error(error.message || 'Failed to update password');
}
throw error;
}
};
// Delete user account
const deleteUserAccount = async () => {
try {
if (!auth.currentUser) {
throw new Error("No user is currently signed in");
}

// Delete user data from Firestore
const userRef = doc(db, "users", currentUser.uid);
await deleteDoc(userRef);
// Delete Firebase auth account
await deleteUser(auth.currentUser);
toast.success('Account deleted successfully');
} catch (error) {
console.error('Error deleting account:', error);
toast.error('Failed to delete account');
throw error;
}
};

// Add this function to handle purchases
const savePurchase = async (purchaseItems) => {
try {
if (!currentUser) {
throw new Error("No user is currently signed in");
}

const userRef = doc(db, "users", currentUser.uid);
const userDoc = await getDoc(userRef);
const currentPurchases = userDoc.data()?.purchases || [];

// Map cart items to purchase items
const newPurchases = purchaseItems.map(item => {
const { id, alt_description, urls, user, price, quantity } = item;
if (!id || !alt_description || !urls?.small || !user?.name || !price) {
console.error("Invalid purchase item:", item);
throw new Error("Invalid purchase item data");
}
return {
id,
title: alt_description,
artist: user.name,
price,
imageUrl: urls.small,
purchaseDate: new Date().toISOString(),
quantity: quantity || 1
};
});

// Combine existing and new purchases
const updatedPurchases = [...currentPurchases, ...newPurchases];

// Update Firestore with new purchases and clear cart
await updateDoc(userRef, {
purchases: updatedPurchases,
cart: [] // Clear the cart after purchase
});

// Update local state
setCurrentUser(prev => ({
...prev,
purchases: updatedPurchases
}));
setCart([]); // Clear the cart
localStorage.removeItem('guestCart');
return true;
} catch (error) {
console.error('Error saving purchase:', error);
toast.error('Failed to complete purchase');
throw error;
}
};

// Add new functions for artist dashboard
const saveArtwork = async (artworkData) => {
try {
if (!currentUser?.uid || !isArtist()) {
throw new Error("Must be logged in as an artist");
}

// Use the existing preview or convert the image
let imageUrl = artworkData.imagePreview;

if (artworkData.image && !imageUrl) {
imageUrl = await new Promise((resolve, reject) => {
const reader = new FileReader();
reader.onload = () => resolve(reader.result);
reader.onerror = reject;
reader.readAsDataURL(artworkData.image);
});
}

// Save to Firestore with image
const artworkRef = await addDoc(collection(db, "artworks"), {
title: artworkData.title,
description: artworkData.description,
price: artworkData.price,
date: artworkData.date,
tags: artworkData.tags,
imageUrl, // Store base64 string
artistId: currentUser.uid,
createdAt: serverTimestamp()
});

// Update user's artworks array
const userRef = doc(db, "users", currentUser.uid);
await updateDoc(userRef, {
artworks: arrayUnion(artworkRef.id)
});

return {
id: artworkRef.id,
...artworkData,
imageUrl
};
} catch (error) {
console.error('Error saving artwork:', error);
throw error;
}
};

const getArtistArtworks = async (artistId = currentUser?.uid) => {
try {
const artworksRef = collection(db, "artworks");
const q = query(artworksRef, where("artistId", "==", artistId));
const querySnapshot = await getDocs(q);
return querySnapshot.docs.map(doc => ({
id: doc.id,
...doc.data()
}));
} catch (error) {
console.error('Error fetching artworks:', error);
throw error;
}
};

const updateArtwork = async (artworkId, updateData) => {
if (!currentUser?.uid) throw new Error("No user logged in");
try {
const artworkRef = doc(db, "artworks", artworkId);
const cleanedData = Object.fromEntries(
Object.entries(updateData).filter(([_, value]) => value !== undefined)
);

await updateDoc(artworkRef, cleanedData);
return true;
} catch (error) {
console.error("Error updating artwork:", error);
throw error;
}
};

const deleteArtwork = async (artworkId) => {
try {
// Delete from Firestore
const artworkRef = doc(db, "artworks", artworkId);
await deleteDoc(artworkRef);

// Update user's artworks array
const userRef = doc(db, "users", currentUser.uid);
await updateDoc(userRef, {
artworks: arrayRemove(artworkId)
});

// Update local state
setCurrentUser(prev => ({
...prev,
artworks: prev.artworks.filter(id => id !== artworkId)
}));
} catch (error) {
console.error('Error deleting artwork:', error);
throw error;
}
};

// Value object with all auth functionality
const value = {
currentUser,
signup,
login,
logout,
continueAsGuest,
isArtist,
canBuyArt,
toggleFavorite,
isArtworkFavorited,
cart,
addToCart,
removeFromCart,
updateCartItemQuantity,
clearCart,
calculateTotal,
updateProfile,
updatePassword: updateUserPassword,
deleteUserAccount,
savePurchase,
saveArtwork,
getArtistArtworks,
updateArtwork,
deleteArtwork,
};

// Provide auth context to child components
return (
<AuthContext.Provider value={value}>
{!loading && children}
</AuthContext.Provider>
);
}

