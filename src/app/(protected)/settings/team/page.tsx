"use client";

import TeamMembers from "@/components/team/TeamMembers";

export default function TeamSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-zinc-100">Team</h3>
        <p className="text-xs text-zinc-500 mt-0.5">Manage team members and permissions</p>
      </div>
      <TeamMembers />
    </div>
  );
}
