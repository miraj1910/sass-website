"use client";

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-zinc-800 bg-zinc-950">
      <div className="flex items-center justify-between h-14 px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-semibold text-zinc-100">
            PulseDesk
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/dashboard" className="rounded-md px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
              Dashboard
            </Link>
            <Link href="/settings" className="rounded-md px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
              Settings
            </Link>
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {status === 'loading' ? (
            <span className="text-sm text-zinc-500">Loading...</span>
          ) : session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-400">{session.user?.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm text-zinc-500 hover:text-zinc-100 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
                Sign in
              </Link>
              <Link href="/signup" className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200 transition-colors">
                Sign up
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-3 space-y-2">
          {status === 'loading' ? (
            <p className="text-sm text-zinc-500">Loading...</p>
          ) : session ? (
            <>
              <p className="text-sm font-medium text-zinc-100">{session.user?.name}</p>
              <p className="text-sm text-zinc-500 truncate">{session.user?.email}</p>
              <div className="pt-2 space-y-1">
                <Link href="/dashboard" className="block rounded-md px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <Link href="/settings" className="block rounded-md px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800" onClick={() => setMenuOpen(false)}>Settings</Link>
              </div>
              <button
                onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }); }}
                className="w-full text-left rounded-md px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block rounded-md px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link href="/signup" className="block rounded-md px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800" onClick={() => setMenuOpen(false)}>Sign up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
