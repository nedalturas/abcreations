'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
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
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  completeMagicLinkSignIn: (email: string) => Promise<void>;
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

  const signIn = async (email: string, password: string) => {
    if (!hasValidConfig() || !auth) {
      // Mock sign in
      setUser({
        uid: 'demo-user',
        email: email,
        displayName: 'Demo User',
        photoURL: null,
      });
      notifications.show({
        title: 'Demo Mode',
        message: 'Signed in with demo credentials',
        color: 'blue',
      });
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      notifications.show({
        title: 'Welcome back!',
        message: 'Successfully signed in',
        color: 'green',
      });
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      notifications.show({
        title: 'Sign In Failed',
        message: errorMessage,
        color: 'red',
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    if (!hasValidConfig() || !auth) {
      // Mock sign up
      setUser({
        uid: 'demo-user',
        email: email,
        displayName: displayName || 'Demo User',
        photoURL: null,
      });
      notifications.show({
        title: 'Demo Mode',
        message: 'Account created with demo credentials',
        color: 'blue',
      });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }

      notifications.show({
        title: 'Account Created!',
        message: 'Welcome to BagCraft Pro',
        color: 'green',
      });
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      notifications.show({
        title: 'Sign Up Failed',
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

  const resetPassword = async (email: string) => {
    if (!hasValidConfig() || !auth) {
      notifications.show({
        title: 'Demo Mode',
        message: 'Password reset email would be sent in production',
        color: 'blue',
      });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      notifications.show({
        title: 'Reset Email Sent',
        message: 'Check your email for password reset instructions',
        color: 'green',
      });
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      notifications.show({
        title: 'Reset Failed',
        message: errorMessage,
        color: 'red',
      });
      throw error;
    }
  };

  const sendMagicLink = async (email: string) => {
    if (!hasValidConfig() || !auth) {
      notifications.show({
        title: 'Demo Mode',
        message: 'Magic link would be sent in production',
        color: 'blue',
      });
      return;
    }

    const actionCodeSettings = {
      url: window.location.origin + '/auth/complete',
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      localStorage.setItem('emailForSignIn', email);
      notifications.show({
        title: 'Magic Link Sent!',
        message: 'Check your email and click the link to sign in',
        color: 'green',
      });
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      notifications.show({
        title: 'Failed to Send Link',
        message: errorMessage,
        color: 'red',
      });
      throw error;
    }
  };

  const completeMagicLinkSignIn = async (email: string) => {
    if (!hasValidConfig() || !auth) {
      notifications.show({
        title: 'Demo Mode',
        message: 'Magic link sign-in completed in demo mode',
        color: 'blue',
      });
      return;
    }

    if (isSignInWithEmailLink(auth, window.location.href)) {
      try {
        await signInWithEmailLink(auth, email, window.location.href);
        localStorage.removeItem('emailForSignIn');
        notifications.show({
          title: 'Welcome!',
          message: 'Successfully signed in with magic link',
          color: 'green',
        });
      } catch (error: any) {
        const errorMessage = getAuthErrorMessage(error.code);
        notifications.show({
          title: 'Sign In Failed',
          message: errorMessage,
          color: 'red',
        });
        throw error;
      }
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
    signIn,
    signUp,
    signOutUser,
    resetPassword,
    sendMagicLink,
    completeMagicLinkSignIn,
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
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    case 'auth/invalid-action-code':
      return 'The sign-in link is invalid or has expired.';
    default:
      return 'An error occurred. Please try again.';
  }
}