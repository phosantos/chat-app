import React from 'react';
import { auth, googleProvider, db } from '../Services/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export const AuthContext = React.createContext();

export const useAuth = () => React.useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
  }, []);

  async function signInWithGoogle() {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const userRef = doc(db, 'user', res.user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        const username = res.user.email.split('@')[0];
        await setDoc(userRef, {
          uid: res.user.uid,
          name: res.user.displayName,
          username,
          email: res.user.email,
          photoURL: res.user.photoURL,
          friends: [],
          groups: [],
        });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err);
    }
  }

  async function userSignOut() {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      setError(err);
    }
  }

  const value = {
    signInWithGoogle,
    userSignOut,
    currentUser,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
