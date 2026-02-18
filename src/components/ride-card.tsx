import Link from "next/link";
import { MapPin, Clock, Users, Banknote, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPrice } from "@/lib/utils";

type RideCardProps = {
  ride: {
    id: string;
    origin: string;
    destination: string;
    dateTime: Date;
    seatsAvailable: number;
    seatsTotal: number;
    price: number | null;
    womenOnly: boolean;
    status: string;
    driver: { name: string; carModel: string | null };
  };
};

export function RideCard({ ride }: RideCardProps) {
  const statusVariant =
    ride.status === "ACTIVE"
      ? "success"
      : ride.status === "FULL"
        ? "warning"
        : "secondary";

  return (
    <Link href={`/rides/${ride.id}`}>
      <Card className="transition-all duration-200 hover:shadow-glow hover:border-primary/20 hover:-translate-y-0.5">
        <CardContent className="p-4">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate font-medium">{ride.origin}</span>
              </div>
              <div className="ml-5 my-0.5 border-l-2 border-dashed border-muted-foreground/30 h-3" />
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-destructive" />
                <span className="truncate font-medium">{ride.destination}</span>
              </div>
            </div>
            <Badge variant={statusVariant} className="shrink-0 ml-2">
              {ride.status}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDate(ride.dateTime)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {ride.seatsAvailable}/{ride.seatsTotal} seats
            </span>
            <span className="flex items-center gap-1">
              <Banknote className="h-3.5 w-3.5" />
              {formatPrice(ride.price)}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {ride.driver.name}
              {ride.driver.carModel && ` · ${ride.driver.carModel}`}
            </span>
            {ride.womenOnly && (
              <Badge variant="outline" className="text-xs gap-1">
                <Shield className="h-3 w-3" />
                Women Only
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
