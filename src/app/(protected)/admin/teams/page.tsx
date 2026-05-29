"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";

type Team = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  owner: { id: string; name: string | null; email: string | null };
  _count: { members: number; metrics: number; invoices: number };
};

const columns: ColumnDef<Team>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div>
        <p className="text-xs font-medium text-zinc-100">{row.original.name}</p>
        <p className="text-[10px] text-zinc-600">{row.original.slug}</p>
      </div>
    ),
  },
  {
    accessorKey: "owner",
    header: "Owner",
    cell: ({ row }) => (
      <span className="text-xs text-zinc-400">
        {row.original.owner.name ?? row.original.owner.email ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "_count",
    header: "Members",
    cell: ({ row }) => (
      <span className="text-xs text-zinc-400">{row.original._count.members}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <span className="text-xs text-zinc-500">
        {new Date(row.original.createdAt).toLocaleDateString()}
      </span>
    ),
  },
];

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/teams", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setTeams(d.teams ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-zinc-100">Teams</h3>
        <p className="text-xs text-zinc-500 mt-0.5">Manage all teams across the platform</p>
      </div>
      <DataTable
        columns={columns}
        data={teams}
        searchKey="name"
        searchPlaceholder="Search teams..."
        loading={loading}
      />
    </div>
  );
}
