"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: "ADMIN" | "MEMBER";
  createdAt: string;
  team: { name: string; id: string } | null;
  _count: { accounts: number; apiKeys: number };
};

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center text-[9px] font-medium text-zinc-400">
          {(row.original.name ?? row.original.email ?? "?")[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-100">{row.original.name ?? "Unnamed"}</p>
          <p className="text-[10px] text-zinc-600">{row.original.email}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge variant={row.original.role === "ADMIN" ? "primary" : "default"}>
        {row.original.role}
      </Badge>
    ),
  },
  {
    accessorKey: "team",
    header: "Team",
    cell: ({ row }) => (
      <span className="text-xs text-zinc-400">
        {row.original.team?.name ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "_count",
    header: "API Keys",
    cell: ({ row }) => (
      <span className="text-xs text-zinc-400">{row.original._count.apiKeys}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => (
      <span className="text-xs text-zinc-500">
        {new Date(row.original.createdAt).toLocaleDateString()}
      </span>
    ),
  },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-zinc-100">Users</h3>
        <p className="text-xs text-zinc-500 mt-0.5">Manage all users across the platform</p>
      </div>
      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        searchPlaceholder="Search users..."
        loading={loading}
      />
    </div>
  );
}
