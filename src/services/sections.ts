
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, writeBatch } from 'firebase/firestore';

const COLLEGE_ID = 'GEC';

export interface Section {
    id: string;
    name: string;
}

export const addSection = async (degreeId: string, streamId: string, batchId: string, yearId: string, sectionData: Omit<Section, 'id'>) => {
    try {
        const batch = writeBatch(db);
        const sectionCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'degrees', degreeId, 'streams', streamId, 'batches', batchId, 'years', yearId, 'sections');
        
        // Create the new section document
        const newSectionRef = doc(sectionCollectionRef); // Auto-generates an ID
        batch.set(newSectionRef, sectionData);

        // Add placeholder documents to the subcollections within the new section
        const collectionsToCreate = ['students', 'teachers', 'subjects', 'assignments', 'notes', 'notice'];
        for (const colName of collectionsToCreate) {
            const placeholderRef = doc(newSectionRef, colName, '_placeholder');
            batch.set(placeholderRef, { initialized: true });
        }
        
        await batch.commit();
        return newSectionRef.id;

    } catch (e) {
        console.error("Error adding section: ", e);
        throw new Error('Failed to add section');
    }
};

export const getSections = async (degreeId: string, streamId: string, batchId: string, yearId: string): Promise<Section[]> => {
    try {
        const sectionCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'degrees', degreeId, 'streams', streamId, 'batches', batchId, 'years', yearId, 'sections');
        const querySnapshot = await getDocs(sectionCollectionRef);
        const sections: Section[] = [];
        querySnapshot.forEach((doc) => {
            if (doc.id !== '_placeholder') {
                sections.push({ id: doc.id, ...doc.data() } as Section);
            }
        });
        return sections.sort((a,b) => a.name.localeCompare(b.name));
    } catch (e) {
        console.error("Error getting sections: ", e);
        throw new Error('Failed to fetch sections');
    }
};
    
