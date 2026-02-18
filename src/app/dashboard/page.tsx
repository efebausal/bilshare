export const dynamic = "force-dynamic";

import Link from "next/link";
import { MapPin, Clock, Users, ChevronRight } from "lucide-react";
import { BilkentGate } from "@/components/bilkent-gate";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMyRides } from "@/actions/rides";
import { formatDate, formatPrice } from "@/lib/utils";
import { FadeIn } from "@/components/motion";

function statusVariant(status: string) {
  switch (status) {
    case "ACTIVE":
      return "success" as const;
    case "FULL":
      return "warning" as const;
    case "ACCEPTED":
      return "success" as const;
    case "PENDING":
      return "warning" as const;
    case "CANCELLED":
    case "REJECTED":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

export default async function DashboardPage() {
  const { createdRides, joinedRequests } = await getMyRides();

  return (
    <BilkentGate>
      <div className="mx-auto max-w-4xl space-y-8">
        <FadeIn>
        <h1 className="text-2xl font-bold tracking-tight">My Dashboard</h1>
        </FadeIn>

        {/* Rides I created */}
        <FadeIn delay={0.05}>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Rides I Created</h2>
            <Button size="sm" asChild>
              <Link href="/rides/new">+ New Ride</Link>
            </Button>
          </div>

          {createdRides.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                You haven&apos;t created any rides yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {createdRides.map((ride) => (
                <Link key={ride.id} href={`/rides/${ride.id}`}>
                  <Card className="transition-all hover:shadow-glow hover:border-primary/20">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{ride.origin}</span>
                          <span className="text-muted-foreground">→</span>
                          <MapPin className="h-3.5 w-3.5 text-destructive shrink-0" />
                          <span className="truncate">{ride.destination}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(ride.dateTime)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {ride.seatsAvailable}/{ride.seatsTotal}
                          </span>
                          <span>
                            {ride.requests.filter((r) => r.status === "PENDING").length} pending
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={statusVariant(ride.status)}>
                          {ride.status}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
        </FadeIn>

        {/* Rides I joined */}
        <FadeIn delay={0.1}>
        <section>
          <h2 className="mb-3 text-lg font-semibold">Rides I Joined</h2>

          {joinedRequests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                You haven&apos;t joined any rides yet.{" "}
                <Link href="/" className="text-primary underline">
                  Browse rides
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {joinedRequests.map((req) => (
                <Link key={req.id} href={`/rides/${req.ride.id}`}>
                  <Card className="transition-all hover:shadow-glow hover:border-primary/20">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{req.ride.origin}</span>
                          <span className="text-muted-foreground">→</span>
                          <MapPin className="h-3.5 w-3.5 text-destructive shrink-0" />
                          <span className="truncate">{req.ride.destination}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(req.ride.dateTime)}
                          </span>
                          <span>Driver: {req.ride.driver.name}</span>
                          <span>{req.seats} seat(s)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={statusVariant(req.status)}>
                          {req.status}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
        </FadeIn>
      </div>
    </BilkentGate>
  );
}
