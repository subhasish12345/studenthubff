
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc } from 'firebase/firestore';

const COLLEGE_ID = 'GEC';

export interface Section {
    id: string;
    name: string;
}

export const addSection = async (degreeId: string, streamId: string, batchId: string, yearId: string, sectionData: Omit<Section, 'id'>) => {
    try {
        const sectionCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'degrees', degreeId, 'streams', streamId, 'batches', batchId, 'years', yearId, 'sections');
        const docRef = await addDoc(sectionCollectionRef, sectionData);
        return docRef.id;
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
        return sections;
    } catch (e) {
        console.error("Error getting sections: ", e);
        throw new Error('Failed to fetch sections');
    }
};

    