"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";

type AuditEntry = {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  userId: string | null;
  ip: string | null;
  createdAt: string;
};

const columns: ColumnDef<AuditEntry>[] = [
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <span className="text-xs font-medium text-zinc-100">{row.original.action}</span>
    ),
  },
  {
    accessorKey: "resource",
    header: "Resource",
    cell: ({ row }) => (
      <span className="text-xs text-zinc-400">
        {row.original.resource}
        {row.original.resourceId && (
          <span className="text-zinc-600 ml-1 font-mono">#{row.original.resourceId.slice(0, 8)}</span>
        )}
      </span>
    ),
  },
  {
    accessorKey: "userId",
    header: "User ID",
    cell: ({ row }) => (
      <span className="text-xs text-zinc-500 font-mono">
        {row.original.userId?.slice(0, 8) ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "ip",
    header: "IP",
    cell: ({ row }) => (
      <span className="text-xs text-zinc-500">{row.original.ip ?? "—"}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Time",
    cell: ({ row }) => (
      <span className="text-xs text-zinc-500">
        {new Date(row.original.createdAt).toLocaleString()}
      </span>
    ),
  },
];

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/audit", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setLogs(d.events ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-zinc-100">Audit Logs</h3>
        <p className="text-xs text-zinc-500 mt-0.5">Track all system events and changes</p>
      </div>
      <DataTable
        columns={columns}
        data={logs}
        pageSize={20}
        loading={loading}
      />
    </div>
  );
}
