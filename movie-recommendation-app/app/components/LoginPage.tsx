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
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      playClickSound();
      setError(null);
      setLoading(true);
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

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

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 px-6 rounded-md transition-all flex items-center justify-center gap-3 mb-6 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-imdb-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-imdb-surface text-imdb-text-secondary">Or continue with email</span>
            </div>
          </div>

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
