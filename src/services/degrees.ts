
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, setDoc, query, where, updateDoc, increment, getDoc, deleteDoc, writeBatch, collectionGroup } from 'firebase/firestore';

// Define the structure of a Degree object
export interface Degree {
  id: string;
  name: string;
  duration: number;
  streamCount: number; 
}

const COLLEGE_ID = 'GEC'; // Hardcoding college ID as per the plan

// This function recursively deletes a document and all its subcollections.
async function deleteCollection(collectionRef: any, batch: any) {
    const snapshot = await getDocs(collectionRef);
    const promises: Promise<any>[] = [];
    snapshot.forEach((doc) => {
        promises.push(deleteDocument(doc.ref, batch));
    });
    await Promise.all(promises);
}

async function deleteDocument(docRef: any, batch: any) {
    const subcollections = ['streams', 'years', 'batches', 'students', 'teachers', 'subjects', 'assignments', 'notes'];
    const promises: Promise<any>[] = [];

    for (const sub of subcollections) {
        const subcollectionRef = collection(docRef, sub);
        promises.push(deleteCollection(subcollectionRef, batch));
    }
    
    await Promise.all(promises);
    batch.delete(docRef);
}

export const deleteDegree = async (degreeId: string) => {
    try {
        const degreeRef = doc(db, 'colleges', COLLEGE_ID, 'degrees', degreeId);
        const batch = writeBatch(db);

        // Start recursive deletion from the degree document
        await deleteDocument(degreeRef, batch);
        
        await batch.commit();
    } catch (e) {
        console.error("Error deleting degree and its subcollections: ", e);
        throw new Error('Failed to delete degree');
    }
};


// This function is now mostly for reading degrees. 
// The creation is handled by setup-collections.ts
export const addDegree = async (degree: Omit<Degree, 'id' | 'streamCount'>): Promise<string> => {
  try {
    const collegeRef = doc(db, 'colleges', COLLEGE_ID);
    // Ensure the parent college document exists.
    await setDoc(collegeRef, { name: "Gandhi Engineering College" }, { merge: true });

    const degreesCollectionRef = collection(collegeRef, 'degrees');
    const docRef = await addDoc(degreesCollectionRef, { ...degree, streamCount: 0 });
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error('Failed to add degree');
  }
};

// Function to get all degrees from Firestore
export const getDegrees = async (): Promise<Degree[]> => {
  try {
    const collegeRef = doc(db, 'colleges', COLLEGE_ID);
    const collegeSnap = await getDoc(collegeRef);
    
    // If the college doc doesn't exist, there are no degrees.
    if (!collegeSnap.exists()) {
      return [];
    }

    const degreesCollectionRef = collection(collegeRef, 'degrees');
    const querySnapshot = await getDocs(degreesCollectionRef);
    const degrees: Degree[] = [];
    querySnapshot.forEach((doc) => {
      degrees.push({ id: doc.id, ...doc.data() } as Degree);
    });
    return degrees;
  } catch (e) {
    console.error("Error getting documents: ", e);
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

export const updateDegree = async (degreeId: string, data: Partial<Omit<Degree, 'id' | 'streamCount'>>) => {
    try {
        const degreeRef = doc(db, 'colleges', COLLEGE_ID, 'degrees', degreeId);
        await updateDoc(degreeRef, data);
    } catch (e) {
        console.error("Error updating degree: ", e);
        throw new Error('Failed to update degree');
    }
};

