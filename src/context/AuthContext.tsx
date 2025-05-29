import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
  AuthError
} from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  userRole: string;
  loading: boolean;
  signup: (email: string, password: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  loginWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [loading, setLoading] = useState(true);

  // Effect to handle authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setCurrentUser(user);
        
        if (user) {
          // Get user role from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || 'user');
          } else {
            // If user document doesn't exist yet, create it
            await setDoc(doc(db, 'users', user.uid), {
              email: user.email,
              displayName: user.displayName || '',
              phoneNumber: user.phoneNumber || '',
              role: 'user',
              createdAt: serverTimestamp(),
              lastLoginAt: serverTimestamp()
            });
            setUserRole('user');
          }
        } else {
          setUserRole('user');
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        setUserRole('user');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  async function signup(email: string, password: string) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        email: email,
        role: 'user',
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      });

      // Send email verification
      if (result.user) {
        await sendEmailVerification(result.user);
      }
      
      return result;
    } catch (error) {
      const authError = error as AuthError;
      console.error("Error in signup:", authError);
      throw authError;
    }
  }

  async function login(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login timestamp
      if (result.user) {
        await setDoc(doc(db, 'users', result.user.uid), {
          lastLoginAt: serverTimestamp()
        }, { merge: true });
      }
      
      return result;
    } catch (error) {
      const authError = error as AuthError;
      console.error("Error in login:", authError);
      throw authError;
    }
  }

  async function loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        // Create user profile in Firestore if it doesn't exist
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          displayName: result.user.displayName || '',
          photoURL: result.user.photoURL || '',
          role: 'user',
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        });
      } else {
        // Update last login timestamp
        await setDoc(doc(db, 'users', result.user.uid), {
          lastLoginAt: serverTimestamp(),
          displayName: result.user.displayName || userDoc.data().displayName,
          photoURL: result.user.photoURL || userDoc.data().photoURL
        }, { merge: true });
      }
      
      return result;
    } catch (error) {
      const authError = error as AuthError;
      console.error("Error in Google sign in:", authError);
      throw authError;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      // Navigation will be handled by the components using useAuth
    } catch (error) {
      console.error("Error in logout:", error);
      throw error;
    }
  }

  async function resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      const authError = error as AuthError;
      console.error("Error in reset password:", authError);
      throw authError;
    }
  }

  async function updateUserProfile(displayName: string) {
    if (!currentUser) throw new Error('No user logged in');
    
    try {
      // Update Firestore user document
      await setDoc(doc(db, 'users', currentUser.uid), {
        displayName,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  async function updateDisplayName(displayName: string) {
    if (!currentUser) throw new Error('No user logged in');

    try {
      await updateProfile(currentUser, { displayName });
      // The onAuthStateChanged listener will update the currentUser state
    } catch (error) {
      console.error("Error updating display name:", error);
      throw error;
    }
  }

  function isAdmin() {
    return userRole === 'admin';
  }

  const value = {
    currentUser,
    userRole,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    updateDisplayName,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}