export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Link from "next/link";
import { Plus, Car } from "lucide-react";
import { BilkentGate } from "@/components/bilkent-gate";
import { RideCard } from "@/components/ride-card";
import { RideFilters } from "@/components/ride-filters";
import { Button } from "@/components/ui/button";
import { getRides } from "@/actions/rides";

type Props = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

async function RideList({ searchParams }: Props) {
  const params = await searchParams;
  const result = await getRides({
    origin: params.origin,
    destination: params.destination,
    date: params.date,
    minSeats: params.minSeats ? parseInt(params.minSeats) : undefined,
    maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
    womenOnly: params.womenOnly === "true",
    page: params.page ? parseInt(params.page) : 1,
  });

  if (result.rides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Car className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="text-lg font-medium">No rides found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your filters or create a new ride.
        </p>
        <Button asChild className="mt-4">
          <Link href="/rides/new">
            <Plus className="mr-2 h-4 w-4" />
            Create a Ride
          </Link>
        </Button>
      </div>
    );
  }

  const currentPage = result.currentPage;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {result.rides.map((ride) => (
          <RideCard key={ride.id} ride={ride as any} />
        ))}
      </div>

      {result.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {currentPage > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/?${new URLSearchParams({ ...params, page: String(currentPage - 1) }).toString()}`}
              >
                Previous
              </Link>
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {result.totalPages}
          </span>
          {currentPage < result.totalPages && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/?${new URLSearchParams({ ...params, page: String(currentPage + 1) }).toString()}`}
              >
                Next
              </Link>
            </Button>
          )}
        </div>
      )}
    </>
  );
}

export default async function HomePage(props: Props) {
  return (
    <BilkentGate>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Available Rides</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Find a ride or offer one to fellow Bilkent students
          </p>
        </div>
        <Button asChild>
          <Link href="/rides/new">
            <Plus className="mr-2 h-4 w-4" />
            New Ride
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading filters...</div>}>
        <RideFilters />
      </Suspense>

      <Suspense
        fallback={
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl border border-primary/5 bg-muted/50" />
            ))}
          </div>
        }
      >
        <RideList searchParams={props.searchParams} />
      </Suspense>
    </BilkentGate>
  );
}
