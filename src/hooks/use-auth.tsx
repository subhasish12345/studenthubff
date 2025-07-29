
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from './use-toast';

type Role = 'student' | 'teacher' | 'admin';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<any>;
  logIn: (email: string, password: string) => Promise<any>;
  logInWithGoogle: () => Promise<any>;
  logOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded admin email
const ADMIN_EMAIL = 'subhasishnayak38@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        // Check for admin role
        if (user.email === ADMIN_EMAIL) {
          setRole('admin');
        } else {
          // TODO: Implement logic to determine teacher or student role from database
          setRole('student'); 
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const signUp = async (email: string, password: string) => {
    await setPersistence(auth, browserLocalPersistence);
    return createUserWithEmailAndPassword(auth, email, password);
  }

  const logIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  }
  
  const logInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    // This is a common practice to ensure the auth domain is correctly set.
    if(auth.app.options.authDomain) {
      provider.setCustomParameters({
        'hd': auth.app.options.authDomain.split('.').slice(-2).join('.')
      });
    }
    return signInWithPopup(auth, provider);
  }

  const logOut = async () => {
    await signOut(auth);
    router.push('/login');
  }

  const value = {
    user,
    role,
    loading,
    signUp,
    logIn,
    logInWithGoogle,
    logOut
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

    