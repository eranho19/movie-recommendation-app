'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, LogOut, User, UserPlus } from 'lucide-react';
import { playClickSound } from '../lib/sounds';

export default function AuthButton() {
  const router = useRouter();
  const { user, signOut, isAuthenticated, loading } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    playClickSound();
    await signOut();
    setShowMenu(false);
  };

  const handleNavigateToLogin = (mode: 'login' | 'signup') => {
    playClickSound();
    setShowMenu(false);
    router.push(`/login?mode=${mode}`);
  };

  if (loading) {
    return (
      <div className="w-10 h-10 bg-imdb-surface border border-imdb-border rounded-full animate-pulse"></div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="relative">
        <button
          onClick={() => {
            playClickSound();
            setShowMenu(!showMenu);
          }}
          className="flex items-center gap-2 bg-imdb-surface border border-imdb-border hover:border-imdb-yellow px-3 py-2 rounded-md transition-all"
          aria-label="User menu"
        >
          <div className="w-8 h-8 bg-imdb-yellow rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-imdb-bg" />
          </div>
          <span className="hidden md:inline text-imdb-text-primary text-sm font-medium">User</span>
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            ></div>
            <div className="absolute right-0 mt-2 w-56 bg-imdb-surface border border-imdb-border rounded-lg shadow-xl z-50">
              <button
                onClick={() => handleNavigateToLogin('login')}
                className="w-full text-left px-4 py-3 text-sm text-imdb-text-primary hover:bg-imdb-bg hover:text-imdb-yellow transition-colors flex items-center gap-3 border-b border-imdb-border first:rounded-t-lg"
              >
                <LogIn className="w-5 h-5" />
                <span>Login</span>
              </button>
              <button
                onClick={() => handleNavigateToLogin('signup')}
                className="w-full text-left px-4 py-3 text-sm text-imdb-text-primary hover:bg-imdb-bg hover:text-imdb-yellow transition-colors flex items-center gap-3 last:rounded-b-lg"
              >
                <UserPlus className="w-5 h-5" />
                <span>Create new account</span>
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => {
          playClickSound();
          setShowMenu(!showMenu);
        }}
        className="flex items-center gap-2 bg-imdb-surface border border-imdb-border hover:border-imdb-yellow px-3 py-2 rounded-md transition-all"
      >
        <div className="w-8 h-8 bg-imdb-yellow rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-imdb-bg" />
        </div>
        <span className="hidden md:inline text-imdb-text-primary text-sm font-medium">
          {user?.email?.split('@')[0] || 'User'}
        </span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-48 bg-imdb-surface border border-imdb-border rounded-lg shadow-xl z-20">
            <div className="p-3 border-b border-imdb-border">
              <p className="text-sm text-imdb-text-primary font-medium truncate">
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-3 text-sm text-imdb-text-secondary hover:bg-imdb-bg hover:text-imdb-yellow transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
