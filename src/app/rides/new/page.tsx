"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FREQUENT_LOCATIONS } from "@/lib/constants";
import { createRide } from "@/actions/rides";

export default function NewRidePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [useCustomOrigin, setUseCustomOrigin] = useState(false);
  const [useCustomDest, setUseCustomDest] = useState(false);

  const [form, setForm] = useState({
    origin: "",
    destination: "",
    dateTime: "",
    seatsTotal: 3,
    price: "",
    notes: "",
    meetingPoint: "",
    womenOnly: false,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const result = await createRide({
          origin: form.origin,
          destination: form.destination,
          dateTime: form.dateTime,
          seatsTotal: form.seatsTotal,
          price: form.price ? parseFloat(form.price) : null,
          notes: form.notes || undefined,
          meetingPoint: form.meetingPoint || undefined,
          womenOnly: form.womenOnly,
        });
        if (result.success) {
          router.push(`/rides/${result.rideId}`);
        }
      } catch (err: any) {
        setError(err.message || "Failed to create ride");
      }
    });
  }

  // Get tomorrow's date as min value for datetime-local
  const minDate = new Date();
  minDate.setMinutes(minDate.getMinutes() + 30);
  const minDateStr = minDate.toISOString().slice(0, 16);

  return (
    <motion.div
      className="mx-auto max-w-2xl"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Create a New Ride</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Origin */}
            <div className="space-y-2">
              <Label>From</Label>
              {useCustomOrigin ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter origin..."
                    value={form.origin}
                    onChange={(e) => setForm({ ...form, origin: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUseCustomOrigin(false);
                      setForm({ ...form, origin: "" });
                    }}
                  >
                    Pick
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Select
                    value={form.origin}
                    onValueChange={(v) => setForm({ ...form, origin: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select origin..." />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENT_LOCATIONS.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUseCustomOrigin(true);
                      setForm({ ...form, origin: "" });
                    }}
                  >
                    Custom
                  </Button>
                </div>
              )}
            </div>

            {/* Destination */}
            <div className="space-y-2">
              <Label>To</Label>
              {useCustomDest ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter destination..."
                    value={form.destination}
                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUseCustomDest(false);
                      setForm({ ...form, destination: "" });
                    }}
                  >
                    Pick
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Select
                    value={form.destination}
                    onValueChange={(v) => setForm({ ...form, destination: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination..." />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENT_LOCATIONS.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUseCustomDest(true);
                      setForm({ ...form, destination: "" });
                    }}
                  >
                    Custom
                  </Button>
                </div>
              )}
            </div>

            {/* Date & Time */}
            <div className="space-y-2">
              <Label>Date & Time</Label>
              <Input
                type="datetime-local"
                value={form.dateTime}
                min={minDateStr}
                onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
                required
              />
            </div>

            {/* Seats and Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Seats</Label>
                <Input
                  type="number"
                  min={1}
                  max={8}
                  value={form.seatsTotal}
                  onChange={(e) => setForm({ ...form, seatsTotal: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Price per Seat (₺, optional)</Label>
                <Input
                  type="number"
                  min={0}
                  step={5}
                  placeholder="0 = Free"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
            </div>

            {/* Meeting Point */}
            <div className="space-y-2">
              <Label>Meeting Point (optional)</Label>
              <Input
                placeholder="e.g. Main Gate, Dorm 76 entrance..."
                value={form.meetingPoint}
                onChange={(e) => setForm({ ...form, meetingPoint: e.target.value })}
                maxLength={200}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Any extra info: luggage, music preference, etc."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                maxLength={500}
                rows={3}
              />
            </div>

            {/* Women Only */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="womenOnly"
                checked={form.womenOnly}
                onChange={(e) => setForm({ ...form, womenOnly: e.target.checked })}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="womenOnly" className="text-sm font-normal">
                Women-only ride (opt-in, visible to all)
              </Label>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creating..." : "Create Ride"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
