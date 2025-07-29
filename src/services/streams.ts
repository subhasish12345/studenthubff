import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { updateStreamCount } from './degrees';

// Define the structure of a Stream object
export interface Stream {
  id: string;
  name: string;
}

// Function to add a new stream to a degree's subcollection
export const addStream = async (degreeId: string, stream: Omit<Stream, 'id'>) => {
  try {
    const streamCollectionRef = collection(db, 'degrees', degreeId, 'streams');
    const docRef = await addDoc(streamCollectionRef, stream);
    
    // Increment the stream count in the parent degree document
    await updateStreamCount(degreeId, 1);

    return docRef.id;
  } catch (e) {
    console.error("Error adding stream: ", e);
    throw new Error('Failed to add stream');
  }
};

// Function to get all streams for a specific degree
export const getStreams = async (degreeId: string): Promise<Stream[]> => {
  try {
    const streamCollectionRef = collection(db, 'degrees', degreeId, 'streams');
    const querySnapshot = await getDocs(streamCollectionRef);
    const streams: Stream[] = [];
    querySnapshot.forEach((doc) => {
      streams.push({ id: doc.id, ...doc.data() } as Stream);
    });
    return streams;
  } catch (e) {
    console.error("Error getting streams: ", e);
    throw new Error('Failed to fetch streams');
  }
};
