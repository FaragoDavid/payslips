import { collection, getDocs, query, orderBy, addDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getDb } from '../services/firebase.js';

export async function fetchPayslipsFromFirestore() {
  const db = getDb();
  const payslipsQuery = query(collection(db, 'payslips'), orderBy('year'), orderBy('month'));
  const snapshot = await getDocs(payslipsQuery);
  return snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }));
}

export async function addPayslipToFirestore(data) {
  const db = getDb();
  const docRef = await addDoc(collection(db, 'payslips'), data);
  return docRef.id;
}
