
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export interface Semester {
  id: string;
  name: string;
}

const COLLEGE_ID = 'GEC';

export const getSemestersForYear = async (degreeId: string, streamId: string, batchId: string, yearId: string): Promise<Semester[]> => {
  try {
    const semesterCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'degrees', degreeId, 'streams', streamId, 'batches', batchId, 'years', yearId, 'semesters');
    const querySnapshot = await getDocs(semesterCollectionRef);
    const semesters: Semester[] = [];
    querySnapshot.forEach((doc) => {
      semesters.push({ id: doc.id, ...doc.data() } as Semester);
    });
    // Sort semesters logically (1st, 2nd...)
    return semesters.sort((a, b) => parseInt(a.name) - parseInt(b.name));
  } catch (e) {
    console.error("Error getting semesters: ", e);
    throw new Error('Failed to fetch semesters for year');
  }
};
