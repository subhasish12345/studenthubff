import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, setDoc, query, orderBy, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

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

// Function to add a new teacher to the central pool AND create an auth user
export const addTeacher = async (teacher: Omit<Teacher, 'id'>, password: string) => {
  if (!password) {
      throw new Error("Password is required to create a teacher user.");
  }
  
  const functions = getFunctions();
  const createUser = httpsCallable(functions, 'createUser');
  
  try {
      // 1. Create the Firebase Auth user via the Cloud Function
      const result: any = await createUser({
          email: teacher.email,
          password: password,
          role: 'teacher'
      });
      
      const { uid } = result.data;
      if (!uid) {
          throw new Error('Failed to create user account.');
      }
      
      // 2. Create the teacher profile in Firestore
      const fbBatch = writeBatch(db);
      
      // Teacher profile in central pool
      const teacherRef = doc(db, 'colleges', COLLEGE_ID, 'teachers', uid);
      fbBatch.set(teacherRef, teacher);
      
      // User role document
      const userRoleRef = doc(db, 'users', uid);
      fbBatch.set(userRoleRef, { role: 'teacher' });

      await fbBatch.commit();
      
      return uid;

  } catch (e) {
      console.error("Error adding teacher: ", e);
      if (e instanceof Error) {
        if(e.message.includes('already-exists')){
            throw new Error('A user with this email already exists.');
        }
        throw new Error(e.message);
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
    // This function should also delete the auth user.
    // For now, it just deletes the firestore doc.
    try {
        const teacherRef = doc(db, 'colleges', COLLEGE_ID, 'teachers', teacherId);
        await deleteDoc(teacherRef);
    } catch(e) {
        console.error("Error deleting teacher: ", e);
        throw new Error('Failed to delete teacher');
    }
}
