
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, query, orderBy } from 'firebase/firestore';

const COLLEGE_ID = 'GEC';

export interface Year {
  id: string;
  name: string;
}

export const getYearsForBatch = async (
  degreeId: string,
  streamId: string,
  batchId: string,
): Promise<Year[]> => {
  try {
    const yearCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'degrees', degreeId, 'streams', streamId, 'batches', batchId, 'years');
    const q = query(yearCollectionRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    const years: Year[] = [];
    querySnapshot.forEach((doc) => {
        if (doc.id !== '_placeholder') {
             years.push({ id: doc.id, ...doc.data() } as Year);
        }
    });
    return years;
  } catch (e) {
    console.error("Error getting years: ", e);
    throw new Error('Failed to fetch years');
  }
};

    