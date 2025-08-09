
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
        const userRoleDoc = await getDoc(doc(db, 'users', user.uid));
        if (userRoleDoc.exists()) {
          setRole(userRoleDoc.data().role);
        } else {
           // This handles first-time sign-ins where role is not yet set
           // The role is usually set explicitly right after account creation.
           // Defaulting to student as a fallback.
            const initialRole = user.email === ADMIN_EMAIL ? 'admin' : 'student';
            await setRoleInFirestore(user.uid, initialRole, user.email || undefined);
            setRole(initialRole);
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
          const dataToSet: { role: Role; email?: string } = { role };
          if (email) {
              dataToSet.email = email;
          }
          await setDoc(doc(db, 'users', uid), dataToSet, { merge: true });
      } catch (error) {
          console.error("Error setting user role:", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not set user role.' });
          throw error; // Re-throw to be caught by the calling function
      }
  };

  const signUp = async (email: string, password: string) => {
    await setPersistence(auth, browserLocalPersistence);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Role is set explicitly by the function that calls signUp (e.g., in AddEditTeacherDialog)
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
