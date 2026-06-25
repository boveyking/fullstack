import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserData {
  user_id: number;
  user_name: string | null;
  email: string | null;
  role?: string | null;
  plan_id?: number;
}

interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  login: (userData: UserData) => void;
  logout: () => void;
  updateUser: (userData: UserData) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'user_data';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);

  // Load user data from localStorage on mount
  useEffect(() => {
    const storedUserData = localStorage.getItem(STORAGE_KEY);
    if (storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        setUser(parsedUserData);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const login = (userData: UserData) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateUser = (userData: UserData) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
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

