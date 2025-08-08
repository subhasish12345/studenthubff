
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, setDoc, query, orderBy, deleteDoc } from 'firebase/firestore';

const COLLEGE_ID = 'GEC';

export interface Designation {
  id: string;
  name: string;
  departmentId: string; // To which department this designation belongs
}

// Add a new designation
export const addDesignation = async (data: Omit<Designation, 'id'>) => {
  try {
    const designationsCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'designations');
    await addDoc(designationsCollectionRef, data);
  } catch (e) {
    console.error("Error adding designation: ", e);
    throw new Error('Failed to create designation.');
  }
};

// Get all designations
export const getDesignations = async (): Promise<Designation[]> => {
  try {
    const designationsCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'designations');
    const q = query(designationsCollectionRef, orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    const designations: Designation[] = [];
    querySnapshot.forEach((doc) => {
      designations.push({ id: doc.id, ...doc.data() } as Designation);
    });
    return designations;
  } catch (e) {
    console.error("Error fetching designations: ", e);
    throw new Error('Failed to fetch designations.');
  }
};

// Delete a designation
export const deleteDesignation = async (designationId: string) => {
  try {
    const designationRef = doc(db, 'colleges', COLLEGE_ID, 'designations', designationId);
    await deleteDoc(designationRef);
  } catch (e) {
    console.error("Error deleting designation: ", e);
    throw new Error('Failed to delete designation.');
  }
};
