'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import SignUpForm from '@/components/auth/SignUpForm';

function getCallbackUrl() {
  const callbackUrl = new URLSearchParams(window.location.search).get('callbackUrl');

  if (callbackUrl && /^\/(?:dashboard|settings|admin)(?:\/|\?|$)/.test(callbackUrl)) {
    return callbackUrl;
  }

  return '/dashboard';
}

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: getCallbackUrl() });
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-sm font-medium text-zinc-100">
          Create your PulseDesk account
        </h1>
        <p className="mt-1 text-xs text-zinc-500">
          Sign up with your Google account
        </p>
      </div>
      <SignUpForm onSubmit={handleSubmit} isLoading={isLoading} />
      <p className="mt-6 text-center text-[10px] text-zinc-600">
        By signing up, you agree to our <a href="#" className="underline hover:text-zinc-400">Terms of Service</a> and <a href="#" className="underline hover:text-zinc-400">Privacy Policy</a>.
      </p>
    </div>
  );
}
