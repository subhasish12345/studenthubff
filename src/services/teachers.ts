
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, query, orderBy, updateDoc, deleteDoc } from 'firebase/firestore';

const COLLEGE_ID = 'GEC';

// Structure of a Teacher object
export interface Teacher {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  phone: string;
  gender: string;
  status: 'Active' | 'Resigned' | 'Suspended';
  role: 'teacher';
}

// Function to add a new teacher's profile to the central pool.
// User account should be created separately.
export const addTeacher = async (uid: string, teacherData: Omit<Teacher, 'id'>) => {
  try {
    if (!uid) {
      throw new Error("User ID is required to add a teacher profile.");
    }
    // Teacher profile in central pool, using UID as document ID
    const teacherRef = doc(db, 'colleges', COLLEGE_ID, 'teachers', uid);
    await setDoc(teacherRef, teacherData);
    return uid;
  } catch (e) {
    console.error("Error adding teacher profile: ", e);
    throw new Error('Failed to add teacher profile to the database.');
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
