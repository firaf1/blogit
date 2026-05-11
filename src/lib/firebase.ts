import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, collection, query, where, getDocs, documentId, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId); 
export const auth = getAuth(app);

// Validation check as per CRITICAL CONSTRAINT
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. Firestore client is offline.");
    }
  }
}
testConnection();

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function incrementArticleView(articleId: string) {
  if (!articleId) return;

  const path = `articleAnalytics/${articleId}`;
  const docRef = doc(db, 'articleAnalytics', String(articleId));
  
  try {
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      await updateDoc(docRef, {
        viewCount: increment(1),
        lastViewedAt: serverTimestamp()
      });
    } else {
      await setDoc(docRef, {
        articleId: String(articleId),
        viewCount: 1,
        lastViewedAt: serverTimestamp()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getArticleViewCount(articleId: string): Promise<number> {
  if (!articleId) return 0;
  
  const path = `articleAnalytics/${articleId}`;
  const docRef = doc(db, 'articleAnalytics', String(articleId));
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().viewCount || 0;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
  return 0;
}

export async function getMultipleArticleViewCounts(articleIds: string[]): Promise<Record<string, number>> {
  if (!articleIds || articleIds.length === 0) return {};
  
  const results: Record<string, number> = {};
  const path = 'articleAnalytics';
  
  // Firestore IN query limit is 30.
  const chunks = [];
  for (let i = 0; i < articleIds.length; i += 30) {
    chunks.push(articleIds.slice(i, i + 30));
  }
  
  try {
    for (const chunk of chunks) {
      const q = query(collection(db, 'articleAnalytics'), where(documentId(), 'in', chunk));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        results[doc.id] = doc.data().viewCount || 0;
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
  
  return results;
}
