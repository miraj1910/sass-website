"use client";

import { useState, useEffect } from "react";
import { Key, Plus, Trash2, Copy, Check } from "lucide-react";

type ApiKey = {
  id: string;
  name: string;
  scopes: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};

export default function ApiKeysSection() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/keys", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys ?? []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchKeys();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newName.trim(), scopes: ["read"] }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewKey(data.key);
        setNewName("");
        setShowCreate(false);
        await fetchKeys();
      }
    } catch {
      // ignore
    }
  };

  const handleRevoke = async (keyId: string) => {
    try {
      await fetch("/api/keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ keyId }),
      });
      await fetchKeys();
    } catch {
      // ignore
    }
  };

  const copyKey = async (key: string) => {
    await navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-medium text-zinc-100">API Keys</h2>
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-900 hover:bg-zinc-200 transition-colors"
          >
            <Plus className="h-3 w-3" />
            New Key
          </button>
        )}
      </div>

      {showCreate && (
        <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-900/30 p-3 flex items-center gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Key name (e.g. Production)"
            className="flex-1 h-8 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <button
            onClick={handleCreate}
            disabled={!newName.trim()}
            className="rounded-md bg-zinc-100 px-2.5 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            Create
          </button>
          <button
            onClick={() => setShowCreate(false)}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            Cancel
          </button>
        </div>
      )}

      {newKey && (
        <div className="mb-4 rounded-lg border border-emerald-800 bg-emerald-900/20 p-3">
          <p className="text-xs text-emerald-500 font-medium mb-1">Key created — copy it now, it won&apos;t be shown again</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs text-zinc-100 bg-zinc-900 rounded px-2 py-1 font-mono break-all">{newKey}</code>
            <button
              onClick={() => copyKey(newKey)}
              className="text-zinc-500 hover:text-zinc-100 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        {loading ? (
          <div className="px-4 py-3 text-xs text-zinc-500">Loading keys...</div>
        ) : keys.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-zinc-500">No API keys yet. Create one to get started.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-500 uppercase tracking-widest">Name</th>
                <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-500 uppercase tracking-widest">Scopes</th>
                <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-500 uppercase tracking-widest">Created</th>
                <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-500 uppercase tracking-widest">Last Used</th>
                <th className="px-4 py-2.5 w-10" />
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id} className="border-b border-zinc-800 last:border-0">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Key className="h-3 w-3 text-zinc-600" />
                      <span className="text-xs text-zinc-300">{k.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-zinc-500">{k.scopes}</td>
                  <td className="px-4 py-2.5 text-xs text-zinc-500">{new Date(k.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5 text-xs text-zinc-500">
                    {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => handleRevoke(k.id)}
                      className="text-zinc-600 hover:text-red-400 transition-colors"
                      aria-label={`Revoke ${k.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
