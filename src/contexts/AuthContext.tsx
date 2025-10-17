import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import type { Profile, Role, Faculty, Career } from '../types';

// Define the shape of the context
interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: Role[];
  faculties: Faculty[];
  careers: Career[];
  loading: boolean;
  logout: () => Promise<void>;
  refetchProfile: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial session
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch general data (roles, faculties, careers)
  useEffect(() => {
    const fetchGeneralData = async () => {
      const { data: rolesData, error: rolesError } = await supabase.from('roles_usuarios').select('*');
      if (rolesError) console.error('Error fetching roles:', rolesError);
      else setRoles(rolesData || []);

      const { data: facultiesData, error: facultiesError } = await supabase.from('facultades').select('*');
      if (facultiesError) console.error('Error fetching faculties:', facultiesError);
      else setFaculties(facultiesData || []);

      const { data: careersData, error: careersError } = await supabase.from('carreras').select('*');
      if (careersError) console.error('Error fetching careers:', careersError);
      else setCareers(careersData || []);
    };

    fetchGeneralData();
  }, []);

  const fetchProfile = useCallback(async () => {
    if (user) {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('perfiles')
          .select(`
            *,
            roles_usuarios ( id, nombre ),
            facultades ( id, nombre ),
            carreras ( id, nombre, id_facultad )
          `)
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error.message);
          setProfile(null);
        } else {
          setProfile(data);
        }
      } catch (e) {
        console.error('An unexpected error occurred:', e);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    } else {
      setProfile(null);
    }
  }, [user]);


  // Fetch profile when user changes
  useEffect(() => {
    fetchProfile();
  }, [user, fetchProfile]);

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const value = {
    session,
    user,
    profile,
    roles,
    faculties,
    careers,
    loading,
    logout,
    refetchProfile: fetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create a hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};