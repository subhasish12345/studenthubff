
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, setDoc, query, where, updateDoc, increment } from 'firebase/firestore';

// Define the structure of a Degree object
export interface Degree {
  id: string;
  name: string;
  duration: number;
  streamCount: number; 
}

const COLLEGE_ID = 'GEC'; // Hardcoding college ID as per the plan

// Function to add a new degree to Firestore
export const addDegree = async (degree: Omit<Degree, 'id' | 'streamCount'> & { streamCount: number }) => {
  try {
    // Ensure the parent college document exists
    const collegeRef = doc(db, 'colleges', COLLEGE_ID);
    await setDoc(collegeRef, { name: "Gandhi Engineering College" }, { merge: true });

    const degreesCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'degrees');
    const docRef = await addDoc(degreesCollectionRef, degree);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error('Failed to add degree');
  }
};

// Function to get all degrees from Firestore
export const getDegrees = async (): Promise<Degree[]> => {
  try {
    const degreesCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'degrees');
    const querySnapshot = await getDocs(degreesCollectionRef);
    const degrees: Degree[] = [];
    querySnapshot.forEach((doc) => {
      degrees.push({ id: doc.id, ...doc.data() } as Degree);
    });
    return degrees;
  } catch (e) {
    console.error("Error getting documents: ", e);
    // It's possible the collection doesn't exist yet, which is not a critical error.
    // Return an empty array in this case.
    return [];
  }
};

// Function to update the stream count for a degree
export const updateStreamCount = async (degreeId: string, count: number) => {
    try {
        const degreeRef = doc(db, 'colleges', COLLEGE_ID, 'degrees', degreeId);
        await updateDoc(degreeRef, {
            streamCount: increment(count)
        });
    } catch (e) {
        console.error("Error updating stream count: ", e);
        throw new Error('Failed to update stream count');
    }
}
