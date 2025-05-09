import { auth, db, storage } from "./firebase";
import {
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  Timestamp,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Auth functions
export const logoutUser = () => signOut(auth);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

// Firestore functions
export const addDocument = (collectionName: string, data: any) =>
  addDoc(collection(db, collectionName), data);

export const getDocuments = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateDocument = (collectionName: string, id: string, data: any) =>
  updateDoc(doc(db, collectionName, id), data);

export const deleteDocument = (collectionName: string, id: string) =>
  deleteDoc(doc(db, collectionName, id));

// Storage functions
export const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

// --- Data Model Types ---
export interface Campaign {
  id?: string;
  restaurant_id: string;
  title: string;
  description: string;
  reward_rate: number;
  active_status: boolean;
}

export interface Submission {
  id?: string;
  influencerId: string;
  campaignId: string;
  contentUrl: string;
  status: string;
  views: number;
  likes: number;
  earnings: number;
}

export interface Invitation {
  id?: string;
  campaign_id: string;
  influencer_id: string;
  status: string;
}

export interface Metrics {
  submission_id: string;
  views: number;
  engagement_rate: number;
  updated_at: string;
  likes?: number;
  spent?: number;
}

// --- Campaign Helpers ---
export const createCampaign = (data: Campaign) => addDocument('campaigns', data);
export const getCampaigns = () => getDocuments('campaigns') as Promise<Campaign[]>;
export const getCampaignsByRestaurant = async (restaurant_id: string) => {
  const q = query(collection(db, 'campaigns'), where('restaurant_id', '==', restaurant_id));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Campaign[];
};
export const updateCampaign = (id: string, data: Partial<Campaign>) => updateDocument('campaigns', id, data);
export const deleteCampaign = (id: string) => deleteDocument('campaigns', id);

// --- Submission Helpers ---
export const createSubmission = (data: Submission) => addDocument('submissions', data);
export const getSubmissions = () => getDocuments('submissions') as Promise<Submission[]>;
export const getSubmissionsByInfluencer = (influencer_id: string) =>
  getDocuments('submissions').then(subs => (subs as Submission[]).filter((s) => s.influencerId === influencer_id));
export const getSubmissionsByCampaign = (campaign_id: string) =>
  getDocuments('submissions').then(subs => (subs as Submission[]).filter((s) => s.campaignId === campaign_id));
export const updateSubmission = (id: string, data: Partial<Submission>) => updateDocument('submissions', id, data);
export const deleteSubmission = (id: string) => deleteDocument('submissions', id);

// --- Invitation Helpers ---
export const createInvitation = (data: Invitation) => addDocument('invitations', data);
export const getInvitations = () => getDocuments('invitations') as Promise<Invitation[]>;
export const getInvitationsByInfluencer = (influencer_id: string) =>
  getDocuments('invitations').then(invites => (invites as Invitation[]).filter((i) => i.influencer_id === influencer_id));
export const getInvitationsByCampaign = (campaign_id: string) =>
  getDocuments('invitations').then(invites => (invites as Invitation[]).filter((i) => i.campaign_id === campaign_id));
export const updateInvitation = (id: string, data: Partial<Invitation>) => updateDocument('invitations', id, data);
export const deleteInvitation = (id: string) => deleteDocument('invitations', id);

// --- Metrics Helpers ---
export const createMetrics = (data: Metrics) => addDocument('metrics', data);
export const getMetrics = () => getDocuments('metrics') as unknown as Promise<Metrics[]>;
export const getMetricsBySubmission = (submission_id: string) =>
  getDocuments('metrics').then(metrics => (metrics as unknown as Metrics[]).find((m) => m.submission_id === submission_id));
export const updateMetrics = async (id: string, data: Partial<Metrics>) => {
  const ref = doc(db, 'metrics', id);
  return setDoc(ref, data, { merge: true });
};
export const deleteMetrics = (id: string) => deleteDocument('metrics', id);

export async function addSubmission({ campaignId, restaurantId, influencerId, contentUrl }: {
  campaignId: string;
  restaurantId: string;
  influencerId: string;
  contentUrl: string;
}) {
  return addDoc(collection(db, 'submissions'), {
    campaignId,
    restaurantId,
    influencerId,
    contentUrl,
    status: 'pending',
    createdAt: Timestamp.now(),
    metrics: { views: 0, likes: 0 }
  });
}

export const getUserById = async (uid: string) => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
};
