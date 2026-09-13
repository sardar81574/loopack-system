import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { LoaderCircle } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const ADMIN_EMAIL = 'sardardhakad81@gmail.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoaderCircle className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  // Agar user logged in nahi hai ya email match nahi hota, toh login page par redirect karein
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;