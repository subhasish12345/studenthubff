import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, setDoc, query, where } from 'firebase/firestore';

// Define the structure of a Degree object
export interface Degree {
  id: string;
  name: string;
  duration: number;
  streams: number; // For now, just a count. We will expand this later.
}

// Function to add a new degree to Firestore
export const addDegree = async (degree: Omit<Degree, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'degrees'), degree);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error('Failed to add degree');
  }
};

// Function to get all degrees from Firestore
export const getDegrees = async (): Promise<Degree[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'degrees'));
    const degrees: Degree[] = [];
    querySnapshot.forEach((doc) => {
      degrees.push({ id: doc.id, ...doc.data() } as Degree);
    });
    return degrees;
  } catch (e) {
    console.error("Error getting documents: ", e);
    return []; // Return empty array on error
  }
};
