import { collection, getDocs, query, orderBy, where, setDoc, addDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase.js';

export async function fetchPayslipsFromFirestore() {
  const snapshot = await getDocs(query(collection(db, 'payslips'), orderBy('year'), orderBy('month')));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addPayslipToFirestore(data) {
  const existing = await getDocs(query(collection(db, 'payslips'), where('year', '==', data.year), where('month', '==', data.month)));
  if (!existing.empty) {
    await setDoc(existing.docs[0].ref, data);
    return existing.docs[0].id;
  }
  const docRef = await addDoc(collection(db, 'payslips'), data);
  return docRef.id;
}
