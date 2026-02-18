"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProfile } from "@/actions/profile";

type Props = {
  initialData: {
    name: string;
    phone: string;
    carModel: string;
    carPlate: string;
    bio: string;
  };
};

export function ProfileForm({ initialData }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState(initialData);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        await updateProfile(form);
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || "Failed to update profile");
      }
    });
  }

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label>Phone (optional)</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+90 5XX XXX XX XX"
                maxLength={20}
              />
              <p className="text-xs text-muted-foreground">
                Visible only to matched ride participants.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Car Model (optional)</Label>
                <Input
                  value={form.carModel}
                  onChange={(e) => setForm({ ...form, carModel: e.target.value })}
                  placeholder="e.g. Honda Civic"
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label>Plate (optional)</Label>
                <Input
                  value={form.carPlate}
                  onChange={(e) => setForm({ ...form, carPlate: e.target.value })}
                  placeholder="06 XX 1234"
                  maxLength={20}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bio (optional)</Label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="A few words about yourself..."
                maxLength={300}
                rows={3}
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
                Profile updated successfully!
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
