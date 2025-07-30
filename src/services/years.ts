
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

// Define the structure of a Year object
export interface Year {
  id: string;
  name: string;
}

const COLLEGE_ID = 'GEC'; // Hardcoding college ID as per the plan

// Function to get all years for a specific stream within a degree
export const getYears = async (degreeId: string, streamId: string): Promise<Year[]> => {
  try {
    const yearCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'degrees', degreeId, 'streams', streamId, 'years');
    const querySnapshot = await getDocs(yearCollectionRef);
    const years: Year[] = [];
    querySnapshot.forEach((doc) => {
      // Assuming the document data matches the Omit<Year, 'id'> structure
      years.push({ id: doc.id, ...doc.data() } as Year);
    });
    return years.sort((a, b) => a.name.localeCompare(b.name)); // Sort years alphabetically/numerically
  } catch (e) {
    console.error("Error getting years: ", e);
    throw new Error('Failed to fetch years');
  }
};
