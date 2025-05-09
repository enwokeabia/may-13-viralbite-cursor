import { useEffect, useState } from 'react';
import { db } from '../firebase/firebase';
import { collection, query, where, onSnapshot, QueryConstraint } from 'firebase/firestore';

export interface Submission {
  id: string;
  campaignId: string;
  restaurantId: string;
  influencerId: string;
  contentUrl: string;
  status: string;
  createdAt: any;
  metrics?: { views: number; likes: number };
}

export function useSubmissions(constraints: QueryConstraint[] = []) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const q = constraints.length
      ? query(collection(db, 'submissions'), ...constraints)
      : query(collection(db, 'submissions'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setSubmissions(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Submission))
        );
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [JSON.stringify(constraints)]);

  return { submissions, loading, error };
} 