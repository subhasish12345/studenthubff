
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';

const COLLEGE_ID = 'GEC';

export type EventType = 'Competition' | 'Workshop' | 'Social' | 'Academic';

export interface Event {
  id: string;
  title: string;
  type: EventType;
  date: number; // Storing as timestamp
  location: string;
  image: string;
  aiHint: string;
}

type EventFirestoreData = Omit<Event, 'id' | 'date'> & {
    date: Timestamp;
}

// Add a new event
export const addEvent = async (data: Omit<Event, 'id'>) => {
  try {
    const eventCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'events');
    const eventData = {
        ...data,
        date: Timestamp.fromMillis(data.date),
    };
    await addDoc(eventCollectionRef, eventData);
  } catch (e) {
    console.error("Error adding event: ", e);
    throw new Error('Failed to create event.');
  }
};

// Get all events
export const getEvents = async (): Promise<Event[]> => {
  try {
    const eventCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'events');
    const q = query(eventCollectionRef, orderBy('date', 'asc'));
    const querySnapshot = await getDocs(q);
    const events: Event[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      events.push({
        id: doc.id,
        ...data,
        date: data.date.toMillis(), 
      } as Event);
    });
    return events;
  } catch (e) {
    console.error("Error fetching events: ", e);
    throw new Error('Failed to fetch events.');
  }
};

// Update an existing event
export const updateEvent = async (eventId: string, data: Partial<Omit<Event, 'id'>>) => {
  try {
    const eventRef = doc(db, 'colleges', COLLEGE_ID, 'events', eventId);
    const eventData = data.date ? { ...data, date: Timestamp.fromMillis(data.date) } : data;
    await updateDoc(eventRef, eventData);
  } catch (e) {
    console.error("Error updating event: ", e);
    throw new Error('Failed to update event.');
  }
};

// Delete an event
export const deleteEvent = async (eventId: string) => {
  try {
    const eventRef = doc(db, 'colleges', COLLEGE_ID, 'events', eventId);
    await deleteDoc(eventRef);
  } catch (e) {
    console.error("Error deleting event: ", e);
    throw new Error('Failed to delete event.');
  }
};
