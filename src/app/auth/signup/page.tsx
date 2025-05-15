"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import Link from 'next/link';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') || 'influencer';
  const { signUp, signIn, signInWithGoogle } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(initialRole);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantLocation, setRestaurantLocation] = useState('');
  const [username, setUsername] = useState('');
  const [instagramUsername, setInstagramUsername] = useState('');
  const [showLogin, setShowLogin] = useState(true);

  // Login logic (by username)
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const userCredential = await signUp(email, password);
      
      // Create user document in Firestore
      const userData: any = {
        email: userCredential.user.email,
        role,
        username,
        fullName,
        createdAt: new Date().toISOString(),
      };
      if (role === "restaurant") {
        userData.restaurantName = restaurantName;
        userData.restaurantLocation = restaurantLocation;
      }
      if (role === "influencer") {
        userData.instagramUsername = instagramUsername;
      }
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);

      router.push(`/${role}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithGoogle();
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        role,
        createdAt: new Date().toISOString(),
      });

      router.push(`/${role}`);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  // Login logic (by username)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      // Find user by username
      const usersRef = await getDoc(doc(db, 'usernames', loginUsername));
      if (!usersRef.exists()) {
        setLoginError('No user found with that username');
        setLoginLoading(false);
        return;
      }
      const userId = usersRef.data().uid;
      // Get user email
      const userDoc = await getDoc(doc(db, 'users', userId));
      const email = userDoc.data()?.email;
      if (!email) {
        setLoginError('No email found for this user');
        setLoginLoading(false);
        return;
      }
      // Sign in with email and password
      const userCredential = await signIn(email, loginPassword);
      const role = userDoc.data()?.role;
      if (role === 'restaurant') router.push('/restaurant');
      else if (role === 'influencer') router.push('/influencer');
      else if (role === 'admin') router.push('/admin');
      else router.push('/');
    } catch (err: any) {
      setLoginError(err.message || 'Failed to sign in');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 py-8">
        {/* Left: Auth Card */}
        <div className="w-full md:w-1/2 bg-white rounded-2xl shadow-xl p-8 flex flex-col justify-center mx-4 sm:mx-8 min-h-[420px]">
          <h1 className="text-4xl font-extrabold text-purple-700 text-center mb-1">ViralBite</h1>
          <p className="text-center text-gray-500 mb-6">Performance-Based Restaurant-Influencer Marketing</p>
          {showLogin ? (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-2 text-left">Log in to your account</h2>
              <form className="space-y-4" onSubmit={handleLogin}>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="Username"
                  value={loginUsername}
                  onChange={e => setLoginUsername(e.target.value)}
                />
                <input
                  type="password"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                />
                {loginError && <div className="text-red-500 text-sm text-center mt-2">{loginError}</div>}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 mt-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold text-lg shadow hover:from-purple-700 hover:to-purple-600 transition-all duration-150"
                >
                  {loginLoading ? 'Logging in...' : 'Log in'}
                </button>
              </form>
              <div className="text-center mt-4">
                <button
                  className="text-purple-700 hover:underline text-sm font-medium"
                  onClick={() => setShowLogin(false)}
                >
                  Don&apos;t have an account? Sign up
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-2 text-left">Create your account</h2>
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Role Toggle */}
                <div className="flex justify-center gap-4 mb-4">
                  <button
                    type="button"
                    className={`flex-1 flex flex-col items-center border rounded-xl py-3 px-2 transition-all duration-150 ${role === 'restaurant' ? 'bg-purple-50 border-purple-600 text-purple-700 font-semibold shadow' : 'bg-white border-gray-300 text-gray-500'} hover:border-purple-400`}
                    onClick={() => setRole('restaurant')}
                  >
                    <span className="text-2xl mb-1">🍽️</span>
                    Restaurant
                  </button>
                  <button
                    type="button"
                    className={`flex-1 flex flex-col items-center border rounded-xl py-3 px-2 transition-all duration-150 ${role === 'influencer' ? 'bg-purple-50 border-purple-600 text-purple-700 font-semibold shadow' : 'bg-white border-gray-300 text-gray-500'} hover:border-purple-400`}
                    onClick={() => setRole('influencer')}
                  >
                    <span className="text-2xl mb-1">👤</span>
                    Influencer
                  </button>
                </div>
                {/* Form Fields */}
                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                  />
                  {role === "restaurant" && (
                    <>
                      <input
                        type="text"
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        placeholder="Restaurant Name"
                        value={restaurantName}
                        onChange={e => setRestaurantName(e.target.value)}
                      />
                      <input
                        type="text"
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        placeholder="City / Location"
                        value={restaurantLocation}
                        onChange={e => setRestaurantLocation(e.target.value)}
                      />
                    </>
                  )}
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                  {role === "influencer" && (
                    <input
                      type="text"
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="Instagram Username"
                      value={instagramUsername}
                      onChange={e => setInstagramUsername(e.target.value)}
                    />
                  )}
                  <input
                    type="email"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                  <input
                    type="password"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                {error && (
                  <div className="text-red-500 text-sm text-center mt-2">{error}</div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-2 rounded-lg bg-purple-700 text-white font-semibold text-lg shadow hover:bg-purple-800 transition-all duration-150"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
              <div className="text-center mt-4">
                <button
                  className="text-purple-700 hover:underline text-sm font-medium"
                  onClick={() => setShowLogin(true)}
                >
                  Already have an account? Log in
                </button>
              </div>
            </>
          )}
        </div>
        {/* Right: Marketing Card */}
        <div className="hidden md:flex flex-col items-center justify-center w-1/2">
          <div className="w-full max-w-md bg-gradient-to-br from-purple-700 via-purple-500 to-purple-400 rounded-2xl shadow-xl p-8 text-white flex flex-col gap-4">
            <h2 className="text-2xl font-bold mb-2">Amplify Your Restaurant's Impact</h2>
            <p className="mb-4">Connect with influencers to create performance-based marketing campaigns that drive real results. Track views, engagement, and calculate ROI in real-time.</p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3"><span className="text-2xl">📊</span> Track real-time performance metrics for all your campaigns</li>
              <li className="flex items-center gap-3"><span className="text-2xl">💸</span> Pay only for actual views and engagement with your content</li>
              <li className="flex items-center gap-3"><span className="text-2xl">🤝</span> Connect with authentic influencers who align with your brand values</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
} 