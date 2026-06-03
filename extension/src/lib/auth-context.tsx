import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { authApi, type AuthResponse } from '../api/auth';
import { storage } from './storage';
import { setAuthToken } from './api';

interface User {
  userId: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from chrome.storage on popup open
    storage.getAuth()
      .then((auth) => {
        if (auth) {
          setAuthToken(auth.accessToken);
          setUser({ userId: auth.userId, email: auth.email });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function applyAuth(response: AuthResponse): Promise<void> {
    await storage.setAuth({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      userId: response.userId,
      email: response.email,
    });
    setAuthToken(response.accessToken);
    setUser({ userId: response.userId, email: response.email });
  }

  async function login(email: string, password: string): Promise<void> {
    const response = await authApi.login(email, password);
    await applyAuth(response);
  }

  async function register(email: string, password: string): Promise<void> {
    const response = await authApi.register(email, password);
    await applyAuth(response);
  }

  async function logout(): Promise<void> {
    try {
      await authApi.logout();
    } catch {
      // Clear locally even if the server call fails
    }
    await storage.clearAuth();
    setAuthToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
