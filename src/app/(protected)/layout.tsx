import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AuthSessionProvider from "@/components/session-provider";
import { authOptions } from "@/lib/auth";
import { AuthError, requireAuth } from "@/lib/rbac";
import { AppShell } from "@/components/layout/AppShell";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    await requireAuth({ requireTeam: false });
  } catch (error) {
    if (error instanceof AuthError && error.status === 401) {
      redirect("/login");
    }
    throw error;
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  return (
    <AuthSessionProvider session={session}>
      <AppShell>{children}</AppShell>
    </AuthSessionProvider>
  );
}
