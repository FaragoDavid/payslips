import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  setDoc,
  addDoc,
  doc,
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getDb } from '../services/firebase.js';

export async function fetchPayslipsFromFirestore() {
  const db = getDb();
  const payslipsQuery = query(collection(db, 'payslips'), orderBy('year'), orderBy('month'));
  const snapshot = await getDocs(payslipsQuery);
  return snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }));
}

export async function addPayslipToFirestore(data) {
  const db = getDb();
  const existing = await getDocs(query(collection(db, 'payslips'), where('year', '==', data.year), where('month', '==', data.month)));
  if (!existing.empty) {
    const existingDoc = existing.docs[0];
    await setDoc(existingDoc.ref, data);
    return existingDoc.id;
  }
  const docRef = await addDoc(collection(db, 'payslips'), data);
  return docRef.id;
}
