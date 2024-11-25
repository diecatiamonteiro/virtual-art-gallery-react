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
  async function signup(email, password, roles = ["artLover"]) {
    try {
      // Create auth account in Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Create user profile document in Firestore database
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        roles, // Can be: ['artLover'], ['artist'], or ['artLover', 'artist']
        createdAt: new Date().toISOString(),
        // Initialize empty arrays for user activities
        favorites: [], // Saved artwork
        purchases: [], // Purchased artwork
        artworks: [], // Created artwork (for artists)
        sales: [], // Completed sales (for artists)
        // Track if artist has completed their profile
        isArtistProfileComplete: roles.includes("artist") ? false : null,
      });

      return userCredential;
    } catch (error) {
      throw error;
    }
  }

  // Convert existing art lover account to artist account
  async function becomeArtist() {
    // Prevent guests from becoming artists
    if (!currentUser || currentUser.isGuest) return;

    try {
      // Get user's current profile
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      // Only proceed if user isn't already an artist
      if (!userData.roles.includes("artist")) {
        const updatedRoles = [...userData.roles, "artist"];

        // Update profile with artist role and new fields
        await updateDoc(userRef, {
          roles: updatedRoles,
          artworks: [], // Initialize artwork collection
          sales: [], // Initialize sales history
          isArtistProfileComplete: false, // Require profile completion
        });

        // Update local user state
        setCurrentUser((prev) => ({
          ...prev,
          roles: updatedRoles,
          isArtistProfileComplete: false,
        }));
      }
    } catch (error) {
      throw error;
    }
  }

  // Log in existing user
  async function login(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Log out current user
  async function logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  }

  // Enable browsing without account
  function continueAsGuest() {
    setCurrentUser({ isGuest: true, roles: ["artLover"] });
  }

  // Helper functions to check user permissions

  function hasRole(role) {
    return currentUser?.roles?.includes(role) || false;
  }

  function isArtist() {
    return hasRole("artist");
  }

  // includes guests
  function isArtLover() {
    return hasRole("artLover") || currentUser?.isGuest;
  }

  function canPurchase() {
    return currentUser !== null; // All users (including guests) can purchase
  }

  // Listen for authentication state changes
  useEffect(() => {
    // Subscribe to Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // If user is logged in, get their Firestore profile
        const userDoc = await getDoc(doc(db, "users", user.uid));
        // Combine auth and profile data
        setCurrentUser({ ...user, ...userDoc.data() });
      } else {
        // No user logged in
        setCurrentUser(null);
      }
      // Mark initial loading as complete
      setLoading(false);
    });

    // Cleanup subscription when component unmounts
    return unsubscribe;
  }, []);

  // Create value object with all auth functionality
  const value = {
    currentUser,
    signup,
    login,
    logout,
    continueAsGuest,
    becomeArtist,
    isArtist,
    isArtLover,
    hasRole,
    canPurchase,
  };

  // Provide auth context to child components
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
