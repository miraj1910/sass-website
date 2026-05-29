import type { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AuthError, requireAuth } from '@/lib/rbac';

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (session) {
    try {
      await requireAuth({ requireTeam: false });
      redirect('/dashboard');
    } catch (error) {
      if (!(error instanceof AuthError && error.status === 401)) {
        throw error;
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-4">
      {children}
    </div>
  );
}
