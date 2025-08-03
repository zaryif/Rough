
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { Entry, User, AuthResponse } from '../types';
import { CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

interface DecodedJwt {
  email: string;
  name: string;
  // ... other properties from Google's token
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<AuthResponse>;
  signUp: (email: string, pass: string) => Promise<AuthResponse>;
  signOut: () => void;
  signInWithGoogle: (credentialResponse: CredentialResponse) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_STORAGE_KEY = 'rough-session';
const USERS_STORAGE_KEY = 'rough-users';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for a logged-in user in session storage on initial load
    try {
      const storedSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (storedSession) {
        setCurrentUser(JSON.parse(storedSession));
      }
    } catch (error) {
      console.error("Failed to load session", error);
    }
    setLoading(false);
  }, []);

  const migrateGuestData = (userEmail: string) => {
      const guestKey = 'rough-entries-guest';
      const userKey = `rough-entries-${userEmail}`;

      const guestDataRaw = localStorage.getItem(guestKey);
      if (guestDataRaw) {
          try {
              const guestEntries: Entry[] = JSON.parse(guestDataRaw);
              if (guestEntries.length > 0) {
                  const userDataRaw = localStorage.getItem(userKey);
                  const userEntries: Entry[] = userDataRaw ? JSON.parse(userDataRaw) : [];
                  
                  const userEntryIds = new Set(userEntries.map(e => e.id));
                  const entriesToMigrate = guestEntries.filter(e => !userEntryIds.has(e.id));
                  
                  const mergedEntries = [...entriesToMigrate, ...userEntries];
                  localStorage.setItem(userKey, JSON.stringify(mergedEntries));
                  localStorage.removeItem(guestKey);
              }
          } catch(e) {
              console.error("Failed to parse or migrate guest data.", e);
          }
      }
  };
  
  const signIn = useCallback(async (email: string, pass: string): Promise<AuthResponse> => {
    // Simulate API call
    const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '{}');
    if (storedUsers[email] && storedUsers[email] === pass) {
      const user: User = { email };
      migrateGuestData(email);
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
      setCurrentUser(user);
      return { user, error: null };
    }
    return { user: null, error: "Invalid email or password." };
  }, []);

  const signUp = useCallback(async (email: string, pass: string): Promise<AuthResponse> => {
    // Simulate API call
    const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '{}');
    if (storedUsers[email]) {
      return { user: null, error: "An account with this email already exists." };
    }
    
    storedUsers[email] = pass;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(storedUsers));
    
    const user: User = { email };
    migrateGuestData(email);
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    setCurrentUser(user);
    return { user, error: null };
  }, []);

  const signInWithGoogle = useCallback(async (credentialResponse: CredentialResponse): Promise<AuthResponse> => {
    if (!credentialResponse.credential) {
        return { user: null, error: 'Google Sign-In failed: No credential returned.' };
    }

    try {
        const decoded: DecodedJwt = jwtDecode(credentialResponse.credential);
        const email = decoded.email;

        const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '{}');
        if (!storedUsers[email]) {
          storedUsers[email] = '__GOOGLE_AUTH__'; // Placeholder for Google authenticated user
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(storedUsers));
        }

        const user: User = { email };
        migrateGuestData(email);
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
        setCurrentUser(user);
        return { user, error: null };
    } catch (error) {
        console.error("Failed to decode Google credential or sign in", error);
        return { user: null, error: "An error occurred during Google Sign-In." };
    }
  }, []);

  const signOut = useCallback(() => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading, signIn, signUp, signOut, signInWithGoogle }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
