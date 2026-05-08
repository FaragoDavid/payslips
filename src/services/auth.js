import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    if (import.meta.env.DEV) {
      setUser({ displayName: 'Dev User', email: 'dev@localhost' });
      return;
    }

    let unsubscribe;

    (async () => {
      const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
      const { getApp } = await import('./firebase.js');
      const auth = getAuth(getApp());
      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
      });
    })();

    return () => unsubscribe?.();
  }, []);

  return user;
}

export async function signIn() {
  const { getAuth, GoogleAuthProvider, signInWithPopup } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
  const { getApp } = await import('./firebase.js');
  const auth = getAuth(getApp());
  await signInWithPopup(auth, new GoogleAuthProvider());
}

export async function signOut() {
  const { getAuth, signOut: firebaseSignOut } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
  const { getApp } = await import('./firebase.js');
  await firebaseSignOut(getAuth(getApp()));
}
