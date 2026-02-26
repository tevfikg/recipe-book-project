import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { syncUser } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function handleSession(session) {
    if (!session) {
      setUser(null);
      setDbUser(null);
      return;
    }
    setUser(session.user);
    try {
      const { data } = await syncUser();
      setDbUser(data.user);
    } catch (err) {
      console.error('Failed to sync user:', err);
    }
  }

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => handleSession(session))
      .catch(() => {})
      .finally(() => setLoading(false));

    let subscription;
    try {
      const result = supabase.auth.onAuthStateChange((_event, session) => {
        handleSession(session);
      });
      subscription = result.data?.subscription;
    } catch {}

    return () => subscription?.unsubscribe();
  }, []);

  const signInWithGoogle = () => supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` }
  });

  const signOut = () => supabase.auth.signOut().then(() => {
    setUser(null);
    setDbUser(null);
  });

  const refreshDbUser = async () => {
    const { data } = await syncUser();
    setDbUser(data.user);
  };

  return (
    <AuthContext.Provider value={{ user, dbUser, loading, signInWithGoogle, signOut, refreshDbUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
