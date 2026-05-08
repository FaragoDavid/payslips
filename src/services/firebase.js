import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: 'payslips-75a69.firebaseapp.com',
  projectId: 'payslips-75a69',
  storageBucket: 'payslips-75a69.firebasestorage.app',
  messagingSenderId: '500179489837',
  appId: '1:500179489837:web:b42063e2afd07b774894a4',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export function getDb() {
  return db;
}

export function getApp() {
  return app;
}
