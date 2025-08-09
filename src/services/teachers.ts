
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, query, orderBy, updateDoc, Timestamp, getDoc, deleteDoc } from 'firebase/firestore';

const COLLEGE_ID = 'GEC';

// Structure of a Teacher object
export interface Teacher {
  id: string;
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

type TeacherFirestoreData = Omit<Teacher, 'id' | 'joiningDate' | 'email' | 'role'> & {
    joiningDate: Timestamp;
};


// Function to add a new teacher's profile to the central pool.
// User account should be created separately.
export const addTeacher = async (uid: string, teacherData: Omit<Teacher, 'id' | 'email' | 'role'>) => {
  try {
    if (!uid) {
      throw new Error("User ID is required to add a teacher profile.");
    }
    const userDoc = await getDoc(doc(db, 'users', uid));
    const userEmail = userDoc.data()?.email;

    if(!userEmail) {
        throw new Error("Could not find user email for the given UID.");
    }

    const teacherRef = doc(db, 'colleges', COLLEGE_ID, 'teachers', uid);

    const firestoreData = {
        ...teacherData,
        email: userEmail,
        joiningDate: Timestamp.fromMillis(teacherData.joiningDate),
        role: 'teacher',
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
