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
import { doc, setDoc, getDoc } from "firebase/firestore";

// Create a context to share auth state across the app
const AuthContext = createContext();

// Custom hook for easy access to auth context
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
  };

  // Provide auth context to child components
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
