
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, setDoc, query, orderBy, deleteDoc } from 'firebase/firestore';

const COLLEGE_ID = 'GEC';

export interface Department {
  id: string;
  name: string;
  type: 'Academic' | 'Non-Academic' | 'Support' | 'Infrastructure' | 'Creative';
}

// Add a new department
export const addDepartment = async (data: Omit<Department, 'id'>) => {
  try {
    const departmentsCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'departments');
    await addDoc(departmentsCollectionRef, data);
  } catch (e) {
    console.error("Error adding department: ", e);
    throw new Error('Failed to create department.');
  }
};

// Get all departments
export const getDepartments = async (): Promise<Department[]> => {
  try {
    const departmentsCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'departments');
    const q = query(departmentsCollectionRef, orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    const departments: Department[] = [];
    querySnapshot.forEach((doc) => {
      departments.push({ id: doc.id, ...doc.data() } as Department);
    });
    return departments;
  } catch (e) {
    console.error("Error fetching departments: ", e);
    throw new Error('Failed to fetch departments.');
  }
};

// Delete a department
export const deleteDepartment = async (departmentId: string) => {
  try {
    const departmentRef = doc(db, 'colleges', COLLEGE_ID, 'departments', departmentId);
    await deleteDoc(departmentRef);
  } catch (e) {
    console.error("Error deleting department: ", e);
    throw new Error('Failed to delete department.');
  }
};
