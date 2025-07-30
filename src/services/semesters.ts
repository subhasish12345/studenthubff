
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export interface Semester {
  id: string;
  name: string;
}

const COLLEGE_ID = 'GEC';

export const getSemestersForBatch = async (degreeId: string, streamId: string, batchId: string): Promise<Semester[]> => {
  try {
    const semesterCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'degrees', degreeId, 'streams', streamId, 'batches', batchId, 'semesters');
    const q = query(semesterCollectionRef, orderBy('__name__')); // Order by document ID (which will be '1-sem', '2-sem', etc.)
    const querySnapshot = await getDocs(q);
    const semesters: Semester[] = [];
    querySnapshot.forEach((doc) => {
        if (doc.id !== '_placeholder') {
           semesters.push({ id: doc.id, ...doc.data() } as Semester);
        }
    });
    return semesters;
  } catch (e) {
    console.error("Error getting semesters: ", e);
    throw new Error('Failed to fetch semesters for batch');
  }
};
