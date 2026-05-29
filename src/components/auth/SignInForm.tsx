interface SignInFormProps {
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading?: boolean;
}

export default function SignInForm({ onSubmit, isLoading = false }: SignInFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label htmlFor="email" className="block text-xs text-zinc-500 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          className="flex h-8 w-full rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:ring-offset-1 focus:ring-offset-zinc-950"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:ring-offset-1 focus:ring-offset-zinc-950 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Signing in...' : 'Sign in with Google'}
        </button>
      </div>
      <p className="text-center text-xs text-zinc-500">
        Don&apos;t have an account?{' '}
        <a href="/signup" className="font-medium text-zinc-100 hover:text-zinc-300">
          Sign up
        </a>
      </p>
    </form>
  );
}
