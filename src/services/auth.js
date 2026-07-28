import { useState, useEffect } from 'react';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { app } from './firebase.js';

const auth = getAuth(app);

export function useAuth() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    if (import.meta.env.DEV) {
      setUser({ displayName: 'Dev User', email: 'dev@localhost' });
      return;
    }

    return onAuthStateChanged(auth, (firebaseUser) => setUser(firebaseUser ?? null));
  }, []);

  return user;
}

export async function signIn() {
  await signInWithPopup(auth, new GoogleAuthProvider());
}

export async function signOut() {
  await firebaseSignOut(auth);
}
