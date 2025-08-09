
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
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from './use-toast';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type Role = 'student' | 'teacher' | 'admin';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<any>;
  logIn: (email: string, password: string) => Promise<any>;
  logInWithGoogle: () => Promise<any>;
  logOut: () => Promise<any>;
  setRole: (uid: string, role: Role, email?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'subhasishnayak38@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (user.email === ADMIN_EMAIL) {
          setRole('admin');
           if (!userDoc.exists()) {
            await setRoleInFirestore(user.uid, 'admin', user.email);
          }
        } else if (userDoc.exists()) {
          setRole(userDoc.data().role);
        } else {
          // This case handles Google sign-in for the first time or if the doc was deleted.
          const defaultRole = 'student';
          setRole(defaultRole);
          await setRoleInFirestore(user.uid, defaultRole, user.email || undefined);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const setRoleInFirestore = async (uid: string, role: Role, email?: string) => {
      try {
          const userRef = doc(db, 'users', uid);
          const dataToSet: { role: Role; email?: string, uid: string } = { role, uid };
          if (email) {
              dataToSet.email = email;
          }
          await setDoc(userRef, dataToSet, { merge: true });
      } catch (error) {
          console.error("Error setting user role:", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not set user role.' });
          throw error;
      }
  };

  const signUp = async (email: string, password: string) => {
    await setPersistence(auth, browserLocalPersistence);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Note: Role is set via the form handleSubmit now, not automatically on signup
    return userCredential;
  }

  const logIn = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  }
  
  const logInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
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
    logOut,
    setRole: setRoleInFirestore
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

    