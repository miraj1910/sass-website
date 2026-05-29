"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-zinc-100">Security</h3>
        <p className="text-xs text-zinc-500 mt-0.5">Manage security settings and authentication</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="current-pw">Current password</Label>
          <Input id="current-pw" type="password" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-pw">New password</Label>
          <Input id="new-pw" type="password" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm-pw">Confirm new password</Label>
          <Input id="confirm-pw" type="password" />
        </div>
        <Button onClick={() => toast.success("Password updated")}>Update password</Button>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-100">Two-factor authentication</p>
            <p className="text-[10px] text-zinc-600 mt-0.5">Add an extra layer of security</p>
          </div>
          <Switch />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-100">Session timeout</p>
            <p className="text-[10px] text-zinc-600 mt-0.5">Automatically sign out after inactivity</p>
          </div>
          <Switch defaultChecked />
        </div>
      </div>
    </div>
  );
}
