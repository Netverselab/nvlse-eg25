'use client';

import { useState, useEffect } from 'react';

interface AuthFormProps {
  onAuthenticated: () => void;
}

export default function AuthForm({ onAuthenticated }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'email' | 'password' | 'waitlist' | 'pending'>('email');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check for existing auth or waitlist status
    const authStatus = localStorage.getItem('nvl_auth_status');
    const authExpiry = localStorage.getItem('nvl_auth_expiry');
    
    if (authStatus && authExpiry) {
      const now = new Date().getTime();
      if (now < parseInt(authExpiry)) {
        if (authStatus === 'authenticated') {
          onAuthenticated();
        } else if (authStatus === 'waitlisted') {
          setStep('waitlist');
          setMessage("Your application is still under review. We'll notify you once approved.");
        } else if (authStatus === 'pending') {
          setStep('pending');
          setMessage("Your application is under review. We'll notify you once approved.");
        }
      } else {
        // Clear expired status
        localStorage.removeItem('nvl_auth_status');
        localStorage.removeItem('nvl_auth_expiry');
      }
    }
  }, [onAuthenticated]);

  const setAuthStatus = (status: string) => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 days from now
    localStorage.setItem('nvl_auth_status', status);
    localStorage.setItem('nvl_auth_expiry', expiryDate.getTime().toString());
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (data.exists) {
        setStep('password');
      } else if (data.status === 'in_waitlist') {
        setStep('pending');
        setMessage("Your application is still under review. We'll notify you once approved.");
        setAuthStatus('pending');
      } else {
        setStep('waitlist');
        setMessage("Thanks for your interest! We've added you to our waitlist.");
        setAuthStatus('waitlisted');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (res.ok) {
        setAuthStatus('authenticated');
        onAuthenticated();
      } else {
        setMessage('Invalid password. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-[#2B2C32] p-8 rounded-lg w-full max-w-md shadow-xl">
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Welcome to NetverseLab</h2>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-3 rounded bg-[#1E1F23] text-white border border-gray-700 focus:border-purple-500 focus:outline-none"
              required
            />
            <button
              type="submit"
              className="w-full p-3 rounded bg-[#FB542B] text-white hover:bg-[#EA431A] transition-colors"
            >
              Continue
            </button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Enter Password</h2>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full p-3 rounded bg-[#1E1F23] text-white border border-gray-700 focus:border-purple-500 focus:outline-none"
              required
            />
            <button
              type="submit"
              className="w-full p-3 rounded bg-[#FB542B] text-white hover:bg-[#EA431A] transition-colors"
            >
              Login
            </button>
          </form>
        )}

        {step === 'waitlist' && (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-white mb-4">Thank You!</h2>
            <div className="bg-[#1E1F23] p-4 rounded-lg mb-4">
              <p className="text-gray-300">{message}</p>
            </div>
            <p className="text-sm text-gray-400">
              We'll review your application and get back to you soon.
            </p>
          </div>
        )}

        {step === 'pending' && (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-white mb-4">Application Pending</h2>
            <p className="text-gray-300">{message}</p>
          </div>
        )}

        {message && !['waitlist', 'pending'].includes(step) && (
          <p className="mt-4 text-red-400 text-center">{message}</p>
        )}
      </div>
    </div>
  );
}