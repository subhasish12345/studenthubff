
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, query, orderBy, writeBatch, getDoc } from 'firebase/firestore';

const COLLEGE_ID = 'GEC';

// Structure of a Batch object
export interface Batch {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  promotedYears: number; // How many times the batch has been manually promoted
  startMonth: number; // e.g., 8 for August
}

export const deleteBatch = async (degreeId: string, streamId: string, batchId: string) => {
    try {
        const batchRef = doc(db, 'colleges', COLLEGE_ID, 'degrees', degreeId, 'streams', streamId, 'batches', batchId);
        const fbBatch = writeBatch(db);

        // Get all years in the batch
        const yearsCollectionRef = collection(batchRef, 'years');
        const yearsSnapshot = await getDocs(yearsCollectionRef);

        for (const yearDoc of yearsSnapshot.docs) {
            // For each year, get all semesters
            const semestersCollectionRef = collection(yearDoc.ref, 'semesters');
            const semestersSnapshot = await getDocs(semestersCollectionRef);

            for (const semesterDoc of semestersSnapshot.docs) {
                // For each semester, get all sections
                const sectionsCollectionRef = collection(semesterDoc.ref, 'sections');
                const sectionsSnapshot = await getDocs(sectionsCollectionRef);

                for (const sectionDoc of sectionsSnapshot.docs) {
                    // For each section, delete all subcollections (students, teachers, etc.)
                    const dataCollections = ['students', 'teachers', 'subjects', 'assignments', 'notes', 'notice'];
                    for (const colName of dataCollections) {
                        const dataColRef = collection(sectionDoc.ref, colName);
                        const dataSnapshot = await getDocs(dataColRef);
                        dataSnapshot.forEach(d => fbBatch.delete(d.ref));
                    }
                    // Delete the section document itself
                    fbBatch.delete(sectionDoc.ref);
                }
                // Delete the semester document
                fbBatch.delete(semesterDoc.ref);
            }
            // Delete the year document
            fbBatch.delete(yearDoc.ref);
        }

        // Delete the batch document itself
        fbBatch.delete(batchRef);

        await fbBatch.commit();
    } catch (e) {
        console.error("Error deleting batch and its subcollections: ", e);
        throw new Error('Failed to delete batch');
    }
};


// Function to add a new batch and its nested structure
export const addBatch = async (degreeId: string, streamId: string, duration: number, batchData: Omit<Batch, 'id'>) => {
  try {
    const fbBatch = writeBatch(db);

    // Create the main batch document
    const batchCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'degrees', degreeId, 'streams', streamId, 'batches');
    const newBatchRef = doc(batchCollectionRef);
    fbBatch.set(newBatchRef, batchData);

    // Create year subcollections, and semester sub-subcollections
    for (let yearNum = 1; yearNum <= duration; yearNum++) {
      const yearSuffix = yearNum === 1 ? 'st' : yearNum === 2 ? 'nd' : yearNum === 3 ? 'rd' : 'th';
      const yearName = `${yearNum}${yearSuffix} Year`;
      const yearId = `${yearNum}-year`;
      
      const yearRef = doc(newBatchRef, 'years', yearId);
      fbBatch.set(yearRef, { name: yearName });

      // Create two semesters for each year
      for (let semNumInYear = 1; semNumInYear <= 2; semNumInYear++) {
        const overallSemNum = (yearNum - 1) * 2 + semNumInYear;
        const semesterSuffix = overallSemNum === 1 ? 'st' : overallSemNum === 2 ? 'nd' : overallSemNum === 3 ? 'rd' : 'th';
        const semName = `${overallSemNum}${semesterSuffix} Semester`;
        const semId = `${overallSemNum}-sem`;

        const semesterRef = doc(yearRef, 'semesters', semId);
        fbBatch.set(semesterRef, { name: semName });

        // Add a placeholder for sections
        const sectionsPlaceholderRef = doc(semesterRef, 'sections', '_placeholder');
        fbBatch.set(sectionsPlaceholderRef, { initialized: true });
      }
    }

    await fbBatch.commit();
    return newBatchRef.id;

  } catch (e) {
    console.error("Error adding batch: ", e);
    throw new Error('Failed to add batch with nested structure');
  }
};

// Function to get all batches for a specific stream, ordered by start year
export const getBatchesForStream = async (degreeId: string, streamId: string): Promise<Batch[]> => {
  try {
    const batchCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'degrees', degreeId, 'streams', streamId, 'batches');
    const q = query(batchCollectionRef, orderBy('startYear', 'desc'));
    const querySnapshot = await getDocs(q);
    const batches: Batch[] = [];
    querySnapshot.forEach((doc) => {
      if (doc.id !== '_placeholder') {
        batches.push({ id: doc.id, ...doc.data() } as Batch);
      }
    });
    return batches;
  } catch (e) {
    console.error("Error getting batches: ", e);
    throw new Error('Failed to fetch batches');
  }
};
