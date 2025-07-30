
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

const COLLEGE_ID = 'GEC';

export type NoticeCategory = 'Academic' | 'Campus Life' | 'Events' | 'Holiday' | 'Sports' | 'Placement' | 'Canteen';

export interface Notice {
  id: string;
  title: string;
  message: string;
  category: NoticeCategory;
  posted_by: string;
  posted_on: number; // Storing as timestamp
  visible_to: {
    all: boolean;
    degrees?: string[];
    years?: string[];
    streams?: string[];
  };
}

// Data for Firestore (omits id, converts date)
type NoticeFirestoreData = Omit<Notice, 'id' | 'posted_on'> & {
    posted_on: any; // For serverTimestamp
}

// Add a new notice
export const addNotice = async (data: Omit<Notice, 'id' | 'posted_on'>) => {
  try {
    const noticeCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'notices');
    const noticeData: NoticeFirestoreData = {
        ...data,
        posted_on: serverTimestamp(),
    };
    await addDoc(noticeCollectionRef, noticeData);
  } catch (e) {
    console.error("Error adding notice: ", e);
    throw new Error('Failed to publish notice.');
  }
};

// Get all notices (for admin view)
export const getNotices = async (): Promise<Notice[]> => {
  try {
    const noticeCollectionRef = collection(db, 'colleges', COLLEGE_ID, 'notices');
    const q = query(noticeCollectionRef, orderBy('posted_on', 'desc'));
    const querySnapshot = await getDocs(q);
    const notices: Notice[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      notices.push({
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp to JS number
        posted_on: data.posted_on.toMillis(), 
      } as Notice);
    });
    return notices;
  } catch (e) {
    console.error("Error fetching notices: ", e);
    throw new Error('Failed to fetch notices.');
  }
};

// Update an existing notice
export const updateNotice = async (noticeId: string, data: Partial<Omit<Notice, 'id' | 'posted_on'>>) => {
  try {
    const noticeRef = doc(db, 'colleges', COLLEGE_ID, 'notices', noticeId);
    await updateDoc(noticeRef, data);
  } catch (e) {
    console.error("Error updating notice: ", e);
    throw new Error('Failed to update notice.');
  }
};

// Delete a notice
export const deleteNotice = async (noticeId: string) => {
  try {
    const noticeRef = doc(db, 'colleges', COLLEGE_ID, 'notices', noticeId);
    await deleteDoc(noticeRef);
  } catch (e) {
    console.error("Error deleting notice: ", e);
    throw new Error('Failed to delete notice.');
  }
};
