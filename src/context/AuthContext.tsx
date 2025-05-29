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
  PhoneAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier
} from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  currentUser: User | null;
  userRole: string;
  loading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
  setupPhoneAuth: (elementId: string) => Promise<void>;
  signInWithPhone: (phoneNumber: string) => Promise<any>;
  confirmPhoneCode: (code: string, verificationId: string) => Promise<void>;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [loading, setLoading] = useState(true);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Get user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || 'user');
          } else {
            // If user document doesn't exist yet, create it
            await setDoc(doc(db, 'users', user.uid), {
              email: user.email,
              displayName: user.displayName,
              phoneNumber: user.phoneNumber,
              role: 'user',
              createdAt: new Date()
            });
            setUserRole('user');
          }
        } catch (error) {
          console.error("Error getting user role:", error);
          setUserRole('user');
        }
      }
      
      setLoading(false);
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
        createdAt: new Date()
      });
      await sendEmailVerification(result.user);
      return result;
    } catch (error) {
      console.error("Error in signup:", error);
      throw error;
    }
  }

  async function login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await signOut(auth);
    navigate('/login');
  }

  async function resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
  }

  async function updateUserProfile(displayName: string) {
    if (!currentUser) throw new Error('No user logged in');
    await updateProfile(currentUser, { displayName });
    
    // Update Firestore user document
    await setDoc(doc(db, 'users', currentUser.uid), {
      displayName
    }, { merge: true });
  }

  async function setupPhoneAuth(elementId: string) {
    if (!window.recaptchaVerifier) {
      const verifier = new RecaptchaVerifier(auth, elementId, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
      setRecaptchaVerifier(verifier);
      window.recaptchaVerifier = verifier;
    }
  }

  async function signInWithPhone(phoneNumber: string) {
    if (!recaptchaVerifier && !window.recaptchaVerifier) {
      throw new Error('reCAPTCHA not initialized');
    }
    
    const verifier = recaptchaVerifier || window.recaptchaVerifier;
    return signInWithPhoneNumber(auth, phoneNumber, verifier);
  }

  async function confirmPhoneCode(code: string, verificationId: string) {
    const credential = PhoneAuthProvider.credential(verificationId, code);
    return auth.currentUser?.linkWithCredential(credential);
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
    logout,
    resetPassword,
    updateUserProfile,
    setupPhoneAuth,
    signInWithPhone,
    confirmPhoneCode,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}