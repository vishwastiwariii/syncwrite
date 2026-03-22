import { useState } from 'react'
import './App.css'
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Editor } from './pages/Editor';

export default function App() {
  const [user, setUser] = useState(!!localStorage.getItem("token"));
  const [docId, setDocId] = useState(null);

  if (!user) return <Auth setUser={setUser} />;

  if (docId) return <Editor docId={docId} />;

  return <Dashboard openDoc={setDocId} />;
}
