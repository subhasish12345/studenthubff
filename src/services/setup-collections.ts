
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
 * Creates the entire nested structure for a new degree.
 * @param degreeName The name of the degree (e.g., "B.Tech").
 * @param duration The duration of the degree in years.
 */
export const createDegreeStructure = async (degreeName: string, duration: number) => {
    if (!degreeName || !duration) {
        throw new Error("Degree name and duration are required.");
    }

    const batch = writeBatch(db);
    const currentYear = new Date().getFullYear();

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

        // 4. Create Year subcollections for each Stream
        for (let i = 1; i <= duration; i++) {
            const yearId = `${i}-year`;
            const yearName = `${i}${i === 1 ? 'st' : i === 2 ? 'nd' : i === 3 ? 'rd' : 'th'} Year`;
            const yearRef = doc(streamRef, 'years', yearId);
            batch.set(yearRef, { name: yearName });

            // 5. Create a default Batch document for each Year
            const batchId = `batch-${currentYear}-${streamId}${i}`;
            const batchName = `${degreeName} ${streamName} ${yearName} ${currentYear}`;
            const batchRef = doc(yearRef, 'batches', batchId);
            batch.set(batchRef, { name: batchName });

            // 6. Create placeholder documents to ensure subcollections are created
            const placeholder = { initialized: true };
            batch.set(doc(batchRef, 'students', '_placeholder'), placeholder);
            batch.set(doc(batchRef, 'teachers', '_placeholder'), placeholder);
            batch.set(doc(batchRef, 'subjects', '_placeholder'), placeholder);
            batch.set(doc(batchRef, 'assignments', '_placeholder'), placeholder);
            batch.set(doc(batchRef, 'notes', '_placeholder'), placeholder);
        }
    }
    
    // Commit the batch write to execute all operations
    await batch.commit();
};
