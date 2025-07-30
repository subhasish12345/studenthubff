
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, query, orderBy } from 'firebase/firestore';

const COLLEGE_ID = 'GEC';

export interface Semester {
  id: string;
  name: string;
}

export const getSemestersForYear = async (
  degreeId: string,
  streamId: string,
  batchId: string,
  yearId: string
): Promise<Semester[]> => {
  try {
    const semesterCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'degrees', degreeId, 'streams', streamId, 'batches', batchId, 'years', yearId, 'semesters');
    const q = query(semesterCollectionRef, orderBy('name')); // Order by name which should be like "1st Semester", "2nd Semester"
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
    throw new Error('Failed to fetch semesters');
  }
};

    