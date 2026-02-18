"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Clock,
  Users,
  Banknote,
  Car,
  Phone,
  Shield,
  MessageCircle,
  Flag,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatPrice } from "@/lib/utils";
import {
  requestJoinRide,
  respondToRequest,
  cancelRide,
  cancelRequest,
  sendMessage,
} from "@/actions/rides";
import { reportUser } from "@/actions/reports";

type Ride = {
  id: string;
  origin: string;
  destination: string;
  dateTime: string;
  seatsTotal: number;
  seatsAvailable: number;
  price: number | null;
  notes: string | null;
  meetingPoint: string | null;
  womenOnly: boolean;
  status: string;
  driver: {
    id: string;
    name: string;
    phone: string | null;
    carModel: string | null;
    carPlate: string | null;
    bio: string | null;
    clerkId: string;
  };
  requests: {
    id: string;
    seats: number;
    status: string;
    note: string | null;
    passenger: { id: string; name: string; phone: string | null };
  }[];
  messages: {
    id: string;
    content: string;
    createdAt: string;
    sender: { id: string; name: string };
  }[];
};

type Props = {
  ride: Ride;
  currentUserId: string | null;
};

export function RideDetails({ ride, currentUserId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [joinNote, setJoinNote] = useState("");
  const [joinSeats, setJoinSeats] = useState(1);
  const [msgContent, setMsgContent] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const isDriver = currentUserId === ride.driver.id;
  const myRequest = ride.requests.find((r) => r.passenger.id === currentUserId);
  const canJoin =
    !isDriver &&
    ride.status === "ACTIVE" &&
    (!myRequest || myRequest.status === "CANCELLED" || myRequest.status === "REJECTED");
  const isParticipant =
    isDriver || (myRequest && myRequest.status === "ACCEPTED");

  const statusVariant =
    ride.status === "ACTIVE"
      ? "success"
      : ride.status === "FULL"
        ? "warning"
        : ride.status === "CANCELLED"
          ? "destructive"
          : "secondary";

  function handleJoin() {
    setError(null);
    startTransition(async () => {
      try {
        await requestJoinRide({ rideId: ride.id, seats: joinSeats, note: joinNote || undefined });
        router.refresh();
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  function handleRespond(requestId: string, action: "ACCEPTED" | "REJECTED") {
    startTransition(async () => {
      try {
        await respondToRequest(requestId, action);
        router.refresh();
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  function handleCancel() {
    if (!confirm("Are you sure you want to cancel this ride?")) return;
    startTransition(async () => {
      try {
        await cancelRide(ride.id);
        router.refresh();
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  function handleCancelRequest(requestId: string) {
    startTransition(async () => {
      try {
        await cancelRequest(requestId);
        router.refresh();
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  function handleSendMessage() {
    if (!msgContent.trim()) return;
    startTransition(async () => {
      try {
        await sendMessage(ride.id, msgContent);
        setMsgContent("");
        router.refresh();
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  function handleReport() {
    if (!reportReason.trim()) return;
    startTransition(async () => {
      try {
        await reportUser({ targetId: ride.driver.id, rideId: ride.id, reason: reportReason });
        setShowReport(false);
        setReportReason("");
        alert("Report submitted. Thank you.");
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to rides
        </Link>
      </Button>

      {/* Main ride info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl">Ride Details</CardTitle>
            <Badge variant={statusVariant}>{ride.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-medium">{ride.origin}</span>
            </div>
            <div className="ml-2 border-l-2 border-dashed border-muted-foreground/30 h-4" />
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-destructive" />
              <span className="font-medium">{ride.destination}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(new Date(ride.dateTime))}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{ride.seatsAvailable}/{ride.seatsTotal} seats</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Banknote className="h-4 w-4 text-muted-foreground" />
              <span>{formatPrice(ride.price)}</span>
            </div>
            {ride.womenOnly && (
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>Women Only</span>
              </div>
            )}
          </div>

          {ride.meetingPoint && (
            <p className="text-sm">
              <strong>Meeting point:</strong> {ride.meetingPoint}
            </p>
          )}
          {ride.notes && (
            <p className="text-sm text-muted-foreground">{ride.notes}</p>
          )}
        </CardContent>
      </Card>

      {/* Driver info */}
      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
            {ride.driver.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-medium">{ride.driver.name}</p>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {ride.driver.carModel && (
                <span className="flex items-center gap-1">
                  <Car className="h-3 w-3" />
                  {ride.driver.carModel}
                  {ride.driver.carPlate && ` (${ride.driver.carPlate})`}
                </span>
              )}
              {isParticipant && ride.driver.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {ride.driver.phone}
                </span>
              )}
            </div>
          </div>
          {!isDriver && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowReport(!showReport)}
              title="Report user"
            >
              <Flag className="h-4 w-4" />
            </Button>
          )}
        </CardContent>
      </Card>

      {showReport && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <Input
              placeholder="Reason for report..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              maxLength={100}
            />
            <div className="flex gap-2">
              <Button size="sm" variant="destructive" onClick={handleReport} disabled={isPending}>
                Submit Report
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowReport(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {/* Join ride */}
      {canJoin && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Request to Join</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="w-24">
                <Input
                  type="number"
                  min={1}
                  max={ride.seatsAvailable}
                  value={joinSeats}
                  onChange={(e) => setJoinSeats(parseInt(e.target.value) || 1)}
                  placeholder="Seats"
                />
              </div>
              <Input
                placeholder="Note for the driver (optional)"
                value={joinNote}
                onChange={(e) => setJoinNote(e.target.value)}
                maxLength={300}
              />
            </div>
            <Button onClick={handleJoin} disabled={isPending} className="w-full">
              {isPending ? "Requesting..." : "Request Seat"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* My request status */}
      {myRequest && myRequest.status !== "CANCELLED" && !isDriver && (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium">Your request</p>
              <p className="text-xs text-muted-foreground">
                {myRequest.seats} seat(s) ·{" "}
                <Badge
                  variant={
                    myRequest.status === "ACCEPTED"
                      ? "success"
                      : myRequest.status === "PENDING"
                        ? "warning"
                        : "destructive"
                  }
                >
                  {myRequest.status}
                </Badge>
              </p>
            </div>
            {(myRequest.status === "PENDING" || myRequest.status === "ACCEPTED") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCancelRequest(myRequest.id)}
                disabled={isPending}
              >
                Cancel Request
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Driver: manage requests */}
      {isDriver && ride.requests.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Passenger Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ride.requests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{req.passenger.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {req.seats} seat(s)
                    {req.note && ` · "${req.note}"`}
                  </p>
                  {req.status === "ACCEPTED" && req.passenger.phone && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3" />
                      {req.passenger.phone}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      req.status === "ACCEPTED"
                        ? "success"
                        : req.status === "PENDING"
                          ? "warning"
                          : "destructive"
                    }
                  >
                    {req.status}
                  </Badge>
                  {req.status === "PENDING" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleRespond(req.id, "ACCEPTED")}
                        disabled={isPending}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRespond(req.id, "REJECTED")}
                        disabled={isPending}
                      >
                        Decline
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Driver cancel */}
      {isDriver && ride.status !== "CANCELLED" && ride.status !== "COMPLETED" && (
        <Button variant="destructive" onClick={handleCancel} disabled={isPending} className="w-full">
          Cancel This Ride
        </Button>
      )}

      {/* Messages */}
      {isParticipant && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ride.messages.length === 0 && (
              <p className="text-sm text-muted-foreground">No messages yet.</p>
            )}
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {ride.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-lg p-2 text-sm ${
                    msg.sender.id === currentUserId
                      ? "ml-8 bg-primary/10"
                      : "mr-8 bg-muted"
                  }`}
                >
                  <p className="text-xs font-medium text-muted-foreground">
                    {msg.sender.name}
                  </p>
                  <p>{msg.content}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={msgContent}
                onChange={(e) => setMsgContent(e.target.value)}
                maxLength={500}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} disabled={isPending} size="sm">
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
