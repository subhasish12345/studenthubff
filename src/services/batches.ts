
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, query, orderBy } from 'firebase/firestore';

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

// Function to add a new batch to a stream's subcollection
export const addBatch = async (degreeId: string, streamId: string, batchData: Omit<Batch, 'id'>) => {
  try {
    const batchCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'degrees', degreeId, 'streams', streamId, 'batches');
    const docRef = await addDoc(batchCollectionRef, batchData);
    return docRef.id;
  } catch (e) {
    console.error("Error adding batch: ", e);
    throw new Error('Failed to add batch');
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
