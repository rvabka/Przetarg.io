import { createContext, useContext, useEffect, useState } from 'react';
import type { User, AuthError, Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  nip: string;
  company_name: string;
  website: string;
  company_size: string;
  tender_description?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, profileData: Omit<UserProfile, 'id'>) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
}

/**
 * Maps Supabase auth error codes/messages to user-friendly Polish messages.
 */
function mapAuthError(error: AuthError): string {
  const code = error.message?.toLowerCase() ?? '';

  if (code.includes('invalid login credentials') || code.includes('invalid_credentials')) {
    return 'Nieprawidłowy email lub hasło.';
  }
  if (code.includes('email not confirmed')) {
    return 'Email nie został potwierdzony. Sprawdź swoją skrzynkę pocztową.';
  }
  if (code.includes('user already registered') || code.includes('already been registered')) {
    return 'Konto z tym adresem email już istnieje.';
  }
  if (code.includes('signup is not allowed') || code.includes('signups not allowed')) {
    return 'Rejestracja jest tymczasowo niedostępna. Spróbuj ponownie później.';
  }
  if (code.includes('rate limit') || code.includes('too many requests')) {
    return 'Zbyt wiele prób. Poczekaj chwilę i spróbuj ponownie.';
  }
  if (code.includes('network') || code.includes('fetch')) {
    return 'Błąd połączenia z serwerem. Sprawdź swoje połączenie internetowe.';
  }
  if (code.includes('weak password') || code.includes('password')) {
    return 'Hasło jest za słabe. Użyj co najmniej 6 znaków.';
  }
  if (code.includes('invalid email') || code.includes('unable to validate email')) {
    return 'Podany adres email jest nieprawidłowy.';
  }

  // Fallback — return original message for debugging
  return `Wystąpił błąd: ${error.message}`;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      const session = data.session;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AuthContext] fetchProfile error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          userId,
        });
        throw error;
      }

      console.log('[AuthContext] Profile fetched successfully:', {
        userId,
        hasFirstName: !!data?.first_name,
        hasCompanyName: !!data?.company_name,
        fieldsPresent: data ? Object.keys(data).filter(k => data[k] != null) : [],
      });

      setProfile(data);
    } catch (error) {
      console.error('[AuthContext] fetchProfile exception:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    profileData: Omit<UserProfile, 'id'>
  ) => {
    try {
      console.log('[AuthContext] signUp started for:', email);

      // Pass user metadata to Supabase Auth so it's stored in raw_user_meta_data
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            phone: profileData.phone,
            nip: profileData.nip,
            company_name: profileData.company_name,
            website: profileData.website,
            company_size: profileData.company_size,
            tender_description: profileData.tender_description,
          },
        },
      });

      if (error) {
        console.error('[AuthContext] signUp auth error:', {
          code: error.status,
          message: error.message,
          name: error.name,
        });
        return { error: { ...error, message: mapAuthError(error) } as AuthError };
      }

      if (!data.user) {
        console.error('[AuthContext] signUp: no user returned from supabase.auth.signUp');
        return { error: new Error('Nie udało się utworzyć konta. Spróbuj ponownie.') as unknown as AuthError };
      }

      console.log('[AuthContext] signUp auth success, userId:', data.user.id);

      // Wait for the database trigger to create the profile row
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update profile with user data (profile is created automatically by database trigger)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          ...profileData,
        })
        .eq('id', data.user.id);

      if (profileError) {
        console.error('[AuthContext] signUp profile update error:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
          userId: data.user.id,
        });
        // Don't fail the entire signup if profile update fails — the user account was created
        // They can update their profile later
        console.warn('[AuthContext] User account created but profile update failed. Profile data can be updated later.');
      } else {
        console.log('[AuthContext] signUp profile update success for userId:', data.user.id);
      }

      return { error: null };
    } catch (error) {
      console.error('[AuthContext] signUp unexpected error:', error);
      return { error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] signIn attempt for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[AuthContext] signIn error:', {
          code: error.status,
          message: error.message,
          name: error.name,
        });
        return { error: { ...error, message: mapAuthError(error) } as AuthError };
      }

      console.log('[AuthContext] signIn success, userId:', data.user?.id);
      return { error: null };
    } catch (error) {
      console.error('[AuthContext] signIn unexpected error:', error);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      console.log('[AuthContext] signOut');
      await supabase.auth.signOut();
    } catch (error) {
      console.error('[AuthContext] signOut error:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      console.log('[AuthContext] updateProfile for userId:', user.id, 'fields:', Object.keys(updates));

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('[AuthContext] updateProfile error:', {
          code: error.code,
          message: error.message,
          details: error.details,
        });
        throw error;
      }

      // Update local profile state
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      console.log('[AuthContext] updateProfile success');
      return { error: null };
    } catch (error) {
      console.error('[AuthContext] updateProfile exception:', error);
      return { error: error as Error };
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
