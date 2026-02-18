"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FREQUENT_LOCATIONS } from "@/lib/constants";

export function RideFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`/?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const clearFilters = () => {
    startTransition(() => {
      router.push("/");
    });
  };

  return (
    <div className="mb-6 space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        <Select
          value={searchParams.get("origin") ?? ""}
          onValueChange={(v) => updateFilter("origin", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="From..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Origins</SelectItem>
            {FREQUENT_LOCATIONS.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("destination") ?? ""}
          onValueChange={(v) => updateFilter("destination", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="To..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Destinations</SelectItem>
            {FREQUENT_LOCATIONS.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={searchParams.get("date") ?? ""}
          onChange={(e) => updateFilter("date", e.target.value)}
          className="h-9"
        />

        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min seats"
            min={1}
            max={8}
            value={searchParams.get("minSeats") ?? ""}
            onChange={(e) => updateFilter("minSeats", e.target.value)}
            className="h-9"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            disabled={isPending}
          >
            Clear
          </Button>
        </div>
      </div>

      {isPending && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Search className="h-4 w-4 animate-pulse" />
          Searching...
        </div>
      )}
    </div>
  );
}
