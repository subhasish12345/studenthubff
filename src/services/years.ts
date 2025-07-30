
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

// Define the structure of a Year object
export interface Year {
  id: string;
  name: string;
}

const COLLEGE_ID = 'GEC'; // Hardcoding college ID as per the plan

// Function to get all years for a specific BATCH within a stream/degree
export const getYearsForBatch = async (degreeId: string, streamId: string, batchId: string): Promise<Year[]> => {
  try {
    const yearCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'degrees', degreeId, 'streams', streamId, 'batches', batchId, 'years');
    const querySnapshot = await getDocs(yearCollectionRef);
    const years: Year[] = [];
    querySnapshot.forEach((doc) => {
      years.push({ id: doc.id, ...doc.data() } as Year);
    });
    // Sort years logically (1st, 2nd, 3rd...)
    return years.sort((a, b) => parseInt(a.name) - parseInt(b.name));
  } catch (e) {
    console.error("Error getting years: ", e);
    throw new Error('Failed to fetch years for batch');
  }
};
