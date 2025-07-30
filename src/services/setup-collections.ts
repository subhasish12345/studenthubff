
import { db } from '@/lib/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';

const COLLEGE_ID = 'GEC';

// Pre-defined streams for specific degrees
const degreeStreamMap: { [key: string]: string[] } = {
    'B.Tech': ['CSE', 'AIML', 'Data Science'],
    'MCA': ['General'],
    'MBA': ['General', 'HR', 'Finance', 'Marketing'],
    'BCA': ['General'],
    'BBA': ['General'],
    'Nursing': ['General'],
};

/**
 * Creates the nested structure for a new degree with streams.
 * Batches are now created dynamically by the admin, so we only set up placeholders.
 * @param degreeName The name of the degree (e.g., "B.Tech").
 * @param duration The duration of the degree in years.
 */
export const createDegreeStructure = async (degreeName: string, duration: number) => {
    if (!degreeName || !duration) {
        throw new Error("Degree name and duration are required.");
    }

    const batch = writeBatch(db);

    // 1. Reference to the college document
    const collegeRef = doc(db, 'colleges', COLLEGE_ID);
    batch.set(collegeRef, { name: "Gandhi Engineering College" }, { merge: true });

    // 2. Create the Degree document
    const degreeId = degreeName.toLowerCase().replace(/\./g, '').replace(/ /g, '-');
    const degreeRef = doc(collegeRef, 'degrees', degreeId);
    const streams = degreeStreamMap[degreeName] || ['General'];
    batch.set(degreeRef, { name: degreeName, duration, streamCount: streams.length });

    // 3. Create Stream subcollections for the Degree
    for (const streamName of streams) {
        const streamId = streamName.toLowerCase().replace(/ /g, '-');
        const streamRef = doc(degreeRef, 'streams', streamId);
        batch.set(streamRef, { name: streamName });

        // 4. Create an empty 'batches' collection with a placeholder
        const batchesRef = doc(streamRef, 'batches', '_placeholder');
        batch.set(batchesRef, { initialized: true });
    }
    
    // Commit the batch write to execute all operations
    await batch.commit();
};
