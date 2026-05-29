import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-sm font-medium text-zinc-100">Access denied</h1>
      <p className="text-xs text-zinc-500">
        You do not have permission to access this area.
      </p>
      <Link className="text-xs text-zinc-300 hover:text-zinc-100 underline-offset-2 hover:underline" href="/dashboard">
        Return to dashboard
      </Link>
    </div>
  );
}
