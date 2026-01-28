'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Film, Mail, Lock, LogIn, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { playClickSound } from '../lib/sounds';

interface LoginPageProps {
  initialMode?: 'login' | 'signup';
  initialError?: string | null;
}

export default function LoginPage({ initialMode = 'login', initialError = null }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { signInWithEmail, signUpWithEmail } = useAuth();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setError(error.message || 'Login failed. Please check your credentials.');
          setLoading(false);
        }
        // If successful, the auth state will update and user will be redirected
      } else {
        // Sign up
        const { error, data } = await signUpWithEmail(email, password);
        if (error) {
          setError(error.message || 'Sign up failed. Please try again.');
          setLoading(false);
        } else {
          // Check if user needs to confirm email
          if (data?.user && !data?.session) {
            // Email confirmation required
            setSuccessMessage('Account created successfully! Please check your email to verify your account before signing in.');
            setLoading(false);
            setTimeout(() => {
              setIsLogin(true);
              setSuccessMessage(null);
            }, 5000);
          } else if (data?.session) {
            // Auto-logged in (email confirmation disabled)
            setSuccessMessage('Account created successfully! You are now logged in.');
            setLoading(false);
            // User will be redirected automatically by auth state change
          } else {
            // Success but unclear state
            setSuccessMessage('Account created successfully!');
            setLoading(false);
            setTimeout(() => {
              setIsLogin(true);
              setSuccessMessage(null);
            }, 3000);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-imdb-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-imdb-yellow rounded-full mb-4">
            <Film className="w-10 h-10 text-imdb-bg" />
          </div>
          <h1 className="text-3xl font-bold text-imdb-text-primary mb-2">
            Let Me Set You Up
          </h1>
          <p className="text-imdb-text-secondary">
            {isLogin ? 'Sign in to discover your perfect movies' : 'Create an account to get started'}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-imdb-surface border border-imdb-border rounded-lg p-8 shadow-xl">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-900 bg-opacity-20 border border-green-500 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-green-300 text-sm">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}


          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-imdb-text-primary mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-imdb-text-secondary" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-imdb-bg border border-imdb-border text-imdb-text-primary rounded-md pl-10 pr-4 py-3 focus:outline-none focus:border-imdb-yellow transition-colors"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-imdb-text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-imdb-text-secondary" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-imdb-bg border border-imdb-border text-imdb-text-primary rounded-md pl-10 pr-4 py-3 focus:outline-none focus:border-imdb-yellow transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-imdb-yellow hover:bg-yellow-500 text-imdb-bg font-bold py-3 px-6 rounded-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLogin ? (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Sign Up
                </>
              )}
            </button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                playClickSound();
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-imdb-yellow hover:text-yellow-400 text-sm font-medium"
            >
              {isLogin ? (
                <>Don't have an account? <span className="underline">Sign up</span></>
              ) : (
                <>Already have an account? <span className="underline">Sign in</span></>
              )}
            </button>
          </div>
        </div>

        {/* Info */}
        <p className="text-center text-imdb-text-secondary text-sm mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
