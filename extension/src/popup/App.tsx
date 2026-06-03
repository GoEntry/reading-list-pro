import { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

type AuthView = 'login' | 'register';

export function App() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState<AuthView>('login');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-gray-900">
        <svg className="animate-spin w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-900 h-full">
        {authView === 'login' ? (
          <LoginPage onSwitchToRegister={() => setAuthView('register')} />
        ) : (
          <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
        )}
      </div>
    );
  }

  // Placeholder — Day 4 will render the bookmarks list here
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-900 px-6">
      <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl
                      flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-emerald-600 dark:text-emerald-400"
             fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-base font-semibold text-gray-900 dark:text-white">
        Signed in as {user.email}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
        Bookmark list coming in the next update.
      </p>
    </div>
  );
}
