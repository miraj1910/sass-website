"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { data: session, update } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (!session?.user?.id) {
          throw new Error("Unauthorized");
        }

        const res = await fetch("/api/team/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to create team");
        }

        toast.success("Team created successfully!");
        await update();
        router.refresh();
        router.push("/dashboard");
      } catch (error: unknown) {
        console.error("Failed to create team:", error);
        const message = error instanceof Error ? error.message : "Failed to create team. Please try again.";
        toast.error(message);
      }
    });
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-sm font-medium text-zinc-100">
            Create your team
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Get started by creating your team workspace
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="team-name" className="block text-xs text-zinc-500 mb-1">
              Team name
            </label>
            <input
              id="team-name"
              type="text"
              required
              maxLength={50}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your team name"
              disabled={isPending}
              className="flex h-8 w-full rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:ring-offset-1 focus:ring-offset-zinc-950 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:ring-offset-1 focus:ring-offset-zinc-950 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Creating team..." : "Create team"}
          </button>
        </form>
      </div>
    </div>
  );
}
