"use client";

import { FormEvent, useEffect, useState, useMemo } from "react";
import { Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

type TeamMember = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: "ADMIN" | "MEMBER";
};

type SortField = "name" | "email" | "role";
type SortDir = "asc" | "desc";

export default function TeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [email, setEmail] = useState("");
  const [canManageMembers, setCanManageMembers] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const loadMembers = async () => {
    const response = await fetch("/api/team/members", { credentials: "include" });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: "Failed to load members" }));
      throw new Error(data.error ?? "Failed to load members");
    }

    const data = await response.json();

    setMembers(data.members ?? []);
    setCanManageMembers(Boolean(data.canManageMembers));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMembers()
      .catch((error) => {
        setMessage(error instanceof Error ? error.message : "Failed to load members");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const aVal = (a[sortField] ?? "").toLowerCase();
      const bVal = (b[sortField] ?? "").toLowerCase();
      const cmp = aVal.localeCompare(bVal);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [members, sortField, sortDir]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-zinc-600" />;
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3 text-zinc-300" /> : <ArrowDown className="h-3 w-3 text-zinc-300" />;
  };

  const handleInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/team/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Failed to add member" }));
        throw new Error(data.error ?? "Failed to add member");
      }

      const data = await response.json();

      setEmail("");
      setMessage("Member added.");
      await loadMembers();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to add member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    setMessage(null);

    try {
      const response = await fetch(`/api/team/members/${memberId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Failed to remove member" }));
        throw new Error(data.error ?? "Failed to remove member");
      }

      const data = await response.json();

      setMembers((current) => current.filter((member) => member.id !== memberId));
      setMessage("Member removed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to remove member");
    }
  };

  return (
    <div>
      <h2 className="text-xs font-medium text-zinc-100 mb-3">Team Members</h2>

      {canManageMembers ? (
        <form onSubmit={handleInvite} className="mb-4 flex items-end gap-2">
          <div className="flex-1">
            <label htmlFor="invite-email" className="block text-xs text-zinc-500 mb-1">
              Invite by email
            </label>
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="member@example.com"
              required
              className="flex h-8 w-full rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:ring-offset-1 focus:ring-offset-zinc-950"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-200 transition-colors disabled:opacity-50 shrink-0"
          >
            {isSubmitting ? "Adding..." : "Add Member"}
          </button>
        </form>
      ) : null}

      {message ? (
        <p className="mb-3 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-400">{message}</p>
      ) : null}

      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        {isLoading ? (
          <div className="px-4 py-6 text-center text-xs text-zinc-500">Loading members...</div>
        ) : sortedMembers.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-zinc-500">No team members yet.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800">
                {(["name", "email", "role"] as SortField[]).map((field) => (
                  <th key={field}>
                    <button
                      onClick={() => toggleSort(field)}
                      className="flex items-center gap-1 px-4 py-2.5 text-[11px] font-medium text-zinc-500 uppercase tracking-widest hover:text-zinc-300 transition-colors"
                    >
                      {field}
                      <SortIcon field={field} />
                    </button>
                  </th>
                ))}
                {canManageMembers && <th className="px-4 py-2.5 w-10" />}
              </tr>
            </thead>
            <tbody>
              {sortedMembers.map((member) => (
                <tr key={member.id} className="border-b border-zinc-800 last:border-0">
                  <td className="px-4 py-2.5 text-xs text-zinc-300">{member.name || "Unnamed"}</td>
                  <td className="px-4 py-2.5 text-xs text-zinc-500">{member.email}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                      {member.role}
                    </span>
                  </td>
                  {canManageMembers && member.role !== "ADMIN" ? (
                    <td className="px-4 py-2.5">
                      <button
                        type="button"
                        onClick={() => handleRemove(member.id)}
                        className="text-zinc-600 hover:text-red-400 transition-colors"
                        aria-label="Remove member"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
