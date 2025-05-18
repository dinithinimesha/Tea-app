// hooks/useSession.js

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Ensure your Supabase client is properly initialized

const useSession = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      // Listen for session changes
      const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
        setSession(session);
      });

      // Cleanup listener on unmount
      return () => {
        authListener?.unsubscribe();
      };
    };

    fetchSession().finally(() => setLoading(false));
  }, []);

  return { session, loading };
};

export default useSession;
