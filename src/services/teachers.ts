
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, query, orderBy, updateDoc, Timestamp, getDoc } from 'firebase/firestore';

const COLLEGE_ID = 'GEC';

// Structure of a Teacher object
export interface Teacher {
  id: string; // This will be the UID from Firebase Auth
  name: string;
  email: string;
  employeeId: string;
  phone: string;
  department: string;
  specialization: string;
  joiningDate: number; // Storing as timestamp
  assignedClasses: {
      degreeId: string;
      batchId: string;
      yearId: string;
      semesterId: string;
      sectionId: string;
      subject: string;
  }[];
  role: 'teacher';
}


/**
 * Adds a new teacher's profile to the Firestore database.
 * This function should be called AFTER the user has been created in Firebase Auth
 * and their role has been set in the 'users' collection.
 * @param uid The user's UID from Firebase Auth.
 * @param teacherData The teacher's profile data.
 * @param email The user's email address.
 */
export const addTeacher = async (uid: string, teacherData: Omit<Teacher, 'id' | 'email' | 'role' | 'assignedClasses'>, email: string) => {
  try {
    if (!uid) {
      throw new Error("User ID is required to add a teacher profile.");
    }

    const teacherRef = doc(db, 'colleges', COLLEGE_ID, 'teachers', uid);

    const firestoreData = {
      ...teacherData,
      email: email, // Use the email passed from the auth creation
      joiningDate: Timestamp.fromMillis(teacherData.joiningDate),
      role: 'teacher' as const,
      assignedClasses: [],
    };

    await setDoc(teacherRef, firestoreData);
    return uid;
  } catch (e) {
    console.error("Error adding teacher profile: ", e);
    const errorMessage = e instanceof Error ? e.message : 'Failed to add teacher profile to the database.';
    throw new Error(errorMessage);
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
      const data = doc.data();
      teachers.push({ 
        id: doc.id,
        ...data,
        joiningDate: data.joiningDate?.toMillis() || 0
      } as Teacher);
    });
    return teachers;
  } catch (e) {
    console.error("Error getting teachers: ", e);
    throw new Error('Failed to fetch teachers');
  }
};

// Function to update an existing teacher's details
export const updateTeacher = async (teacherId: string, data: Partial<Omit<Teacher, 'id' | 'role' | 'email'>>) => {
    try {
        const teacherRef = doc(db, 'colleges', COLLEGE_ID, 'teachers', teacherId);
        
        const updateData: any = { ...data };
        if (data.joiningDate) {
            updateData.joiningDate = Timestamp.fromMillis(data.joiningDate);
        }

        await updateDoc(teacherRef, updateData);
    } catch (e) {
        console.error("Error updating teacher: ", e);
        throw new Error('Failed to update teacher details');
    }
}
