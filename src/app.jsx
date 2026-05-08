import React from 'react';
import { useAuth } from './services/auth.js';
import Login from './components/login.jsx';
import Dashboard from './components/dashboard.jsx';

export default function App() {
  const user = useAuth();

  if (user === undefined) return null;

  return <div className="container">{user ? <Dashboard /> : <Login />}</div>;
}
