'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import SignInForm from '@/components/auth/SignInForm';

function LoginContent() {
  const searchParams = useSearchParams();
  const authError = searchParams.get('error');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const callbackUrl = searchParams.get('callbackUrl');
      const destination =
        callbackUrl && /^\/(?:dashboard|settings|admin)(?:\/|\?|$)/.test(callbackUrl)
          ? callbackUrl
          : '/dashboard';

      await signIn('google', { callbackUrl: destination });
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-sm font-medium text-zinc-100">
          Sign in to PulseDesk
        </h1>
        <p className="mt-1 text-xs text-zinc-500">
          Sign in with your Google account
        </p>
      </div>
      {authError && (
        <p role="alert" className="rounded-md border border-zinc-800 bg-zinc-900 p-3 text-xs text-zinc-400 mb-4">
          Sign-in failed. Check the OAuth and database configuration before trying again.
        </p>
      )}
      <SignInForm onSubmit={handleSubmit} isLoading={isLoading} />
      <p className="mt-6 text-center text-[10px] text-zinc-600">
        By signing in, you agree to our <a href="#" className="underline hover:text-zinc-400">Terms of Service</a> and <a href="#" className="underline hover:text-zinc-400">Privacy Policy</a>.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
