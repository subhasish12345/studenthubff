
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, query, orderBy } from 'firebase/firestore';

const COLLEGE_ID = 'GEC';

export interface Section {
  id: string;
  name: string;
}

export const addSection = async (
  degreeId: string,
  streamId: string,
  batchId: string,
  yearId: string,
  semesterId: string,
  section: Omit<Section, 'id'>
) => {
  try {
    const sectionCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'degrees', degreeId, 'streams', streamId, 'batches', batchId, 'years', yearId, 'semesters', semesterId, 'sections');
    const docRef = await addDoc(sectionCollectionRef, section);

    // TODO: Add subcollections for students, teachers, etc.
    return docRef.id;
  } catch (e) {
    console.error("Error adding section: ", e);
    throw new Error('Failed to add section');
  }
};

export const getSectionsForSemester = async (
  degreeId: string,
  streamId: string,
  batchId: string,
  yearId: string,
  semesterId: string
): Promise<Section[]> => {
  try {
    const sectionCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'degrees', degreeId, 'streams', streamId, 'batches', batchId, 'years', yearId, 'semesters', semesterId, 'sections');
    const q = query(sectionCollectionRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    const sections: Section[] = [];
    querySnapshot.forEach((doc) => {
      if (doc.id !== '_placeholder') {
        sections.push({ id: doc.id, ...doc.data() } as Section);
      }
    });
    return sections;
  } catch (e) {
    console.error("Error getting sections: ", e);
    throw new Error('Failed to fetch sections');
  }
};

    