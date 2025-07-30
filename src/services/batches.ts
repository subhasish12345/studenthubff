
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

// This function recursively deletes a document and all its subcollections.
async function deleteSubcollections(docRef: any, batch: any) {
    const subcollections = await docRef.listCollections();
    for (const subcollection of subcollections) {
        const snapshot = await subcollection.get();
        snapshot.forEach((doc: any) => {
            batch.delete(doc.ref);
            // NOTE: This is not fully recursive. If sub-collections have their own sub-collections,
            // a more robust recursive solution would be needed. For now, it handles one level deep.
        });
    }
}

export const deleteBatch = async (degreeId: string, streamId: string, batchId: string) => {
    try {
        const batchRef = doc(db, 'colleges', COLLEGE_ID, 'degrees', degreeId, 'streams', streamId, 'batches', batchId);
        const batch = writeBatch(db);

        // Delete all documents in all subcollections of the batch
        const yearsCollectionRef = collection(batchRef, 'years');
        const yearsSnapshot = await getDocs(yearsCollectionRef);
        for (const yearDoc of yearsSnapshot.docs) {
             const sectionsCollectionRef = collection(yearDoc.ref, 'sections');
             const sectionsSnapshot = await getDocs(sectionsCollectionRef);
             for (const sectionDoc of sectionsSnapshot.docs) {
                 const dataCollections = ['students', 'teachers', 'subjects', 'assignments', 'notes', 'notice'];
                 for(const colName of dataCollections) {
                    const dataColRef = collection(sectionDoc.ref, colName);
                    const dataSnapshot = await getDocs(dataColRef);
                    dataSnapshot.forEach(d => batch.delete(d.ref));
                 }
                 batch.delete(sectionDoc.ref);
             }
            batch.delete(yearDoc.ref);
        }

        // Delete the batch document itself
        batch.delete(batchRef);

        await batch.commit();
    } catch (e) {
        console.error("Error deleting batch and its subcollections: ", e);
        throw new Error('Failed to delete batch');
    }
};


// Function to add a new batch and its nested structure
export const addBatch = async (degreeId: string, streamId: string, duration: number, batchData: Omit<Batch, 'id'>) => {
  try {
    const batch = writeBatch(db);

    // 1. Create the main batch document
    const batchCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'degrees', degreeId, 'streams', streamId, 'batches');
    const newBatchRef = doc(batchCollectionRef); // Create a new ref with a unique ID
    batch.set(newBatchRef, batchData);

    // 2. Create Year subcollections within the batch
    for (let i = 1; i <= duration; i++) {
        const yearName = `${i}${i === 1 ? 'st' : i === 2 ? 'nd' : i === 3 ? 'rd' : 'th'}-year`;
        const yearRef = doc(newBatchRef, 'years', yearName);
        batch.set(yearRef, { name: `${i}${i === 1 ? 'st' : i === 2 ? 'nd' : i === 3 ? 'rd' : 'th'} Year` });

        // 3. Create a default Section 'A' within each year
        const sectionRef = doc(yearRef, 'sections', 'sec-a');
        batch.set(sectionRef, { name: 'Section A' });

        // 4. Create placeholder documents in the final data collections
        const collectionsToCreate = ['students', 'teachers', 'subjects', 'assignments', 'notes', 'notice'];
        for (const colName of collectionsToCreate) {
            const placeholderRef = doc(sectionRef, colName, '_placeholder');
            batch.set(placeholderRef, { initialized: true });
        }
    }

    await batch.commit();
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

    