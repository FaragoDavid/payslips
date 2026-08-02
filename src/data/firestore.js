import { collection, getDocs, query, orderBy, where, setDoc, addDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase.js';

export async function fetchPayslipsFromFirestore(collectionName) {
  const snapshot = await getDocs(query(collection(db, collectionName), orderBy('year'), orderBy('month')));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addPayslipToFirestore(collectionName, data) {
  const existing = await getDocs(query(collection(db, collectionName), where('year', '==', data.year), where('month', '==', data.month)));
  if (!existing.empty) {
    await setDoc(existing.docs[0].ref, data);
    return existing.docs[0].id;
  }
  const docRef = await addDoc(collection(db, collectionName), data);
  return docRef.id;
}
