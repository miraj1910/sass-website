export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
          PulseDesk
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500">
          Social Media Analytics
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-zinc-100 px-3.5 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200 transition-colors"
          >
            Sign in
          </a>
          <a
            href="/signup"
            className="inline-flex items-center justify-center rounded-md border border-zinc-700 px-3.5 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
