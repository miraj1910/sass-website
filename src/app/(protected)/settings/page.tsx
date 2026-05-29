"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function GeneralSettingsPage() {
  const [name, setName] = useState("My Workspace");
  const [slug, setSlug] = useState("my-workspace");
  const [email, setEmail] = useState("admin@example.com");
  const [darkMode, setDarkMode] = useState(true);

  function handleSave() {
    toast.success("Settings saved");
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-zinc-100">General</h3>
        <p className="text-xs text-zinc-500 mt-0.5">Basic workspace settings</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Workspace name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <p className="text-[10px] text-zinc-600">Used in URLs: pulsedesk.app/{slug}</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Notification email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-100">Dark mode</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">Use dark theme across the app</p>
        </div>
        <Switch checked={darkMode} onCheckedChange={setDarkMode} />
      </div>

      <Separator />

      <div className="flex items-center gap-2">
        <Button onClick={handleSave}>Save changes</Button>
        <Button variant="ghost">Cancel</Button>
      </div>
    </div>
  );
}
