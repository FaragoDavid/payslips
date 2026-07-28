import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: 'payslips-75a69.firebaseapp.com',
  projectId: 'payslips-75a69',
  storageBucket: 'payslips-75a69.firebasestorage.app',
  messagingSenderId: '500179489837',
  appId: '1:500179489837:web:b42063e2afd07b774894a4',
});

export const db = getFirestore(app);
export { app };
