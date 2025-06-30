'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import {
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth, hasValidConfig } from '@/lib/firebase';
import { notifications } from '@mantine/notifications';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasValidConfig() || !auth) {
      // Mock user for development without Firebase
      setUser({
        uid: 'demo-user',
        email: 'demo@bagcraft.com',
        displayName: 'Demo User',
        photoURL: null,
      });
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    if (!hasValidConfig() || !auth) {
      // Mock Google sign in
      setUser({
        uid: 'demo-user',
        email: 'demo@gmail.com',
        displayName: 'Demo User',
        photoURL: 'https://via.placeholder.com/40x40?text=DU',
      });
      notifications.show({
        title: 'Demo Mode',
        message: 'Signed in with demo Google account',
        color: 'blue',
      });
      return;
    }

    const provider = new GoogleAuthProvider();
    
    // Configure the provider with additional settings
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    // Add required scopes
    provider.addScope('email');
    provider.addScope('profile');

    try {
      // Check if we're in a secure context
      if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        throw new Error('Google Sign-In requires HTTPS or localhost');
      }

      const result = await signInWithPopup(auth, provider);
      
      notifications.show({
        title: 'Welcome!',
        message: `Signed in as ${result.user.displayName || result.user.email}`,
        color: 'green',
      });
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      
      let errorMessage = 'An error occurred during sign-in. Please try again.';
      
      // Handle specific error cases
      if (error.code) {
        errorMessage = getAuthErrorMessage(error.code);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      notifications.show({
        title: 'Sign In Failed',
        message: errorMessage,
        color: 'red',
      });
      
      throw error;
    }
  };

  const signOutUser = async () => {
    if (!hasValidConfig() || !auth) {
      // Mock sign out
      setUser(null);
      notifications.show({
        title: 'Signed Out',
        message: 'See you next time!',
        color: 'blue',
      });
      return;
    }

    try {
      await signOut(auth);
      notifications.show({
        title: 'Signed Out',
        message: 'See you next time!',
        color: 'blue',
      });
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: 'Failed to sign out',
        color: 'red',
      });
      throw error;
    }
  };

  const updateUserProfile = async (displayName: string) => {
    if (!hasValidConfig() || !auth || !auth.currentUser) {
      // Mock update
      if (user) {
        setUser({ ...user, displayName });
      }
      notifications.show({
        title: 'Profile Updated',
        message: 'Your profile has been updated',
        color: 'green',
      });
      return;
    }

    try {
      await updateProfile(auth.currentUser, { displayName });
      notifications.show({
        title: 'Profile Updated',
        message: 'Your profile has been updated',
        color: 'green',
      });
    } catch (error: any) {
      notifications.show({
        title: 'Update Failed',
        message: 'Failed to update profile',
        color: 'red',
      });
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signOutUser,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Helper function to get user-friendly error messages
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled. Please try again.';
    case 'auth/popup-blocked':
      return 'Pop-up was blocked by your browser. Please allow pop-ups and try again.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled. Please try again.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email but different sign-in credentials.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/configuration-not-found':
      return 'Google Sign-In is not properly configured. Please check your Firebase settings.';
    case 'auth/invalid-api-key':
      return 'Invalid API key. Please check your Firebase configuration.';
    case 'auth/invalid-app-credential':
      return 'Invalid app credentials. Please check your Firebase configuration.';
    case 'auth/operation-not-allowed':
      return 'Google Sign-In is not enabled. Please enable it in Firebase Console.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized. Please add it to your Firebase project settings.';
    default:
      return `Authentication error (${errorCode}). Please check your Firebase configuration.`;
  }
}