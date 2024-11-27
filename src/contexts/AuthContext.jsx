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
import { auth, db } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
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
  };

  // Provide auth context to child components
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
