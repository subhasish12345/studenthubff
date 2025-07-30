
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, query, orderBy, writeBatch, getDoc } from 'firebase/firestore';

const COLLEGE_ID = 'GEC';

// Structure of a Batch object
export interface Batch {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  promotedYears: number; // How many times the batch has been manually promoted
  startMonth: number; // e.g., 8 for August
}

export const deleteBatch = async (degreeId: string, streamId: string, batchId: string) => {
    try {
        const batchRef = doc(db, 'colleges', COLLEGE_ID, 'degrees', degreeId, 'streams', streamId, 'batches', batchId);
        const fbBatch = writeBatch(db);

        // Delete all documents in all subcollections of the batch
        const semestersCollectionRef = collection(batchRef, 'semesters');
        const semestersSnapshot = await getDocs(semestersCollectionRef);
        for(const semesterDoc of semestersSnapshot.docs) {
            const sectionsCollectionRef = collection(semesterDoc.ref, 'sections');
            const sectionsSnapshot = await getDocs(sectionsCollectionRef);
            for (const sectionDoc of sectionsSnapshot.docs) {
                const dataCollections = ['students', 'teachers', 'subjects', 'assignments', 'notes', 'notice'];
                for(const colName of dataCollections) {
                   const dataColRef = collection(sectionDoc.ref, colName);
                   const dataSnapshot = await getDocs(dataColRef);
                   dataSnapshot.forEach(d => fbBatch.delete(d.ref));
                }
                fbBatch.delete(sectionDoc.ref);
            }
            fbBatch.delete(semesterDoc.ref);
        }

        // Delete the batch document itself
        fbBatch.delete(batchRef);

        await fbBatch.commit();
    } catch (e) {
        console.error("Error deleting batch and its subcollections: ", e);
        throw new Error('Failed to delete batch');
    }
};


// Function to add a new batch and its nested structure
export const addBatch = async (degreeId: string, streamId: string, duration: number, batchData: Omit<Batch, 'id'>) => {
  try {
    const fbBatch = writeBatch(db);

    const batchCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'degrees', degreeId, 'streams', streamId, 'batches');
    const newBatchRef = doc(batchCollectionRef);
    fbBatch.set(newBatchRef, batchData);
    
    const totalSemesters = duration * 2;

    for (let i = 1; i <= totalSemesters; i++) {
        const semSuffix = i === 1 ? 'st' : i === 2 ? 'nd' : i === 3 ? 'rd' : 'th';
        const semName = `${i}${semSuffix} Semester`;
        const semId = `${i}-sem`;
        const semesterRef = doc(newBatchRef, 'semesters', semId);
        fbBatch.set(semesterRef, { name: semName });

        const sectionRef = doc(semesterRef, 'sections', 'sec-a');
        fbBatch.set(sectionRef, { name: 'Section A' });

        const collectionsToCreate = ['students', 'teachers', 'subjects', 'assignments', 'notes', 'notice'];
        for (const colName of collectionsToCreate) {
            const placeholderRef = doc(sectionRef, colName, '_placeholder');
            fbBatch.set(placeholderRef, { initialized: true });
        }
    }

    await fbBatch.commit();
    return newBatchRef.id;

  } catch (e) {
    console.error("Error adding batch: ", e);
    throw new Error('Failed to add batch with nested structure');
  }
};

// Function to get all batches for a specific stream, ordered by start year
export const getBatchesForStream = async (degreeId: string, streamId: string): Promise<Batch[]> => {
  try {
    const batchCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'degrees', degreeId, 'streams', streamId, 'batches');
    const q = query(batchCollectionRef, orderBy('startYear', 'desc'));
    const querySnapshot = await getDocs(q);
    const batches: Batch[] = [];
    querySnapshot.forEach((doc) => {
      if (doc.id !== '_placeholder') {
        batches.push({ id: doc.id, ...doc.data() } as Batch);
      }
    });
    return batches;
  } catch (e) {
    console.error("Error getting batches: ", e);
    throw new Error('Failed to fetch batches');
  }
};
