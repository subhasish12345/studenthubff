
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
    if (snapshot.size === 0) {
        return;
    }
    snapshot.forEach((doc) => {
        batch.delete(doc.ref);
        // Recursively delete subcollections
        const subcollections = ['years', 'semesters', 'sections', 'students', 'teachers', 'subjects', 'assignments', 'notes', 'notice'];
        subcollections.forEach(sub => {
            deleteCollection(collection(doc.ref, sub), batch);
        });
    });
}

export const deleteDegree = async (degreeId: string) => {
    try {
        const degreeRef = doc(db, 'colleges', COLLEGE_ID, 'degrees', degreeId);
        const fbBatch = writeBatch(db);

        // Delete subcollections of degree
        const streamsCollectionRef = collection(degreeRef, 'streams');
        const streamsSnapshot = await getDocs(streamsCollectionRef);
        for(const streamDoc of streamsSnapshot.docs) {
             const batchesCollectionRef = collection(streamDoc.ref, 'batches');
             const batchesSnapshot = await getDocs(batchesCollectionRef);
             for(const batchDoc of batchesSnapshot.docs){
                const yearsCollectionRef = collection(batchDoc.ref, 'years');
                const yearsSnapshot = await getDocs(yearsCollectionRef);
                for(const yearDoc of yearsSnapshot.docs){
                   const semestersCollectionRef = collection(yearDoc.ref, 'semesters');
                   const semestersSnapshot = await getDocs(semestersCollectionRef);
                   for(const semesterDoc of semestersSnapshot.docs){
                      const sectionsCollectionRef = collection(semesterDoc.ref, 'sections');
                      await deleteCollection(sectionsCollectionRef, fbBatch);
                      fbBatch.delete(semesterDoc.ref);
                   }
                   fbBatch.delete(yearDoc.ref);
                }
                fbBatch.delete(batchDoc.ref);
             }
             fbBatch.delete(streamDoc.ref);
        }

        // Finally, delete the degree document itself
        fbBatch.delete(degreeRef);
        
        await fbBatch.commit();
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

    