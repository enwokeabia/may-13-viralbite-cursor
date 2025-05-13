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
  views: number;
  likes: number;
  earnings: number;
}

export function useSubmissions(constraints: QueryConstraint[] = [], fetchAll = false) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (constraints.length === 0 && !fetchAll) {
      setSubmissions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const q = constraints.length > 0
      ? query(collection(db, 'submissions'), ...constraints)
      : query(collection(db, 'submissions'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setSubmissions(
          snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              campaignId: data.campaignId,
              restaurantId: data.restaurantId,
              influencerId: data.influencerId,
              contentUrl: data.contentUrl,
              status: data.status,
              createdAt: data.createdAt,
              views: data.views ?? 0,
              likes: data.likes ?? 0,
              earnings: data.earnings ?? 0,
            };
          })
        );
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [JSON.stringify(constraints), fetchAll]);

  return { submissions, loading, error };
} 