import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, setDoc, query, orderBy, updateDoc, deleteDoc } from 'firebase/firestore';

const COLLEGE_ID = 'GEC';

// Structure of a Teacher object
export interface Teacher {
  id: string;
  name: string;
  email: string;
  employeeId: string;
}

// Function to add a new teacher to the central pool
export const addTeacher = async (teacher: Omit<Teacher, 'id'>) => {
  try {
    const teachersCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'teachers');
    const docRef = await addDoc(teachersCollectionRef, teacher);
    return docRef.id;
  } catch (e) {
    console.error("Error adding teacher: ", e);
    if (e instanceof Error && e.message.includes('permission-denied')) {
        throw new Error('You do not have permission to add teachers.');
    }
    throw new Error('Failed to add teacher');
  }
};

// Function to get all teachers from the central pool
export const getTeachers = async (): Promise<Teacher[]> => {
  try {
    const teachersCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'teachers');
    const q = query(teachersCollectionRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    const teachers: Teacher[] = [];
    querySnapshot.forEach((doc) => {
      teachers.push({ id: doc.id, ...doc.data() } as Teacher);
    });
    return teachers;
  } catch (e) {
    console.error("Error getting teachers: ", e);
    throw new Error('Failed to fetch teachers');
  }
};

// Function to update an existing teacher's details
export const updateTeacher = async (teacherId: string, data: Partial<Omit<Teacher, 'id'>>) => {
    try {
        const teacherRef = doc(db, 'colleges', COLLEGE_ID, 'teachers', teacherId);
        await updateDoc(teacherRef, data);
    } catch (e) {
        console.error("Error updating teacher: ", e);
        throw new Error('Failed to update teacher details');
    }
}

// Function to delete a teacher from the central pool
export const deleteTeacher = async (teacherId: string) => {
    try {
        const teacherRef = doc(db, 'colleges', COLLEGE_ID, 'teachers', teacherId);
        await deleteDoc(teacherRef);
    } catch(e) {
        console.error("Error deleting teacher: ", e);
        throw new Error('Failed to delete teacher');
    }
}
