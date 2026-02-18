"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertBilkentUser } from "@/lib/auth";
import {
  createRideSchema,
  joinRideSchema,
  type CreateRideInput,
} from "@/lib/validations";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { Prisma } from "@prisma/client";

export async function createRide(input: CreateRideInput) {
  const user = await assertBilkentUser();
  const parsed = createRideSchema.parse(input);

  const ride = await db.ride.create({
    data: {
      driverId: user.id,
      origin: parsed.origin,
      destination: parsed.destination,
      dateTime: new Date(parsed.dateTime),
      seatsTotal: parsed.seatsTotal,
      seatsAvailable: parsed.seatsTotal,
      price: parsed.price ?? null,
      notes: parsed.notes ?? null,
      meetingPoint: parsed.meetingPoint ?? null,
      womenOnly: parsed.womenOnly ?? false,
    },
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  return { success: true, rideId: ride.id };
}

export async function getRides(filters: {
  origin?: string;
  destination?: string;
  date?: string;
  minSeats?: number;
  maxPrice?: number;
  womenOnly?: boolean;
  page?: number;
}) {
  const page = filters.page ?? 1;
  const where: Prisma.RideWhereInput = {
    status: { in: ["ACTIVE", "FULL"] },
    dateTime: { gte: new Date() },
  };

  if (filters.origin) {
    where.origin = { contains: filters.origin, mode: "insensitive" };
  }
  if (filters.destination) {
    where.destination = { contains: filters.destination, mode: "insensitive" };
  }
  if (filters.date) {
    const start = new Date(filters.date);
    const end = new Date(filters.date);
    end.setDate(end.getDate() + 1);
    where.dateTime = { gte: start, lt: end };
  }
  if (filters.minSeats) {
    where.seatsAvailable = { gte: filters.minSeats };
  }
  if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
    where.price = { lte: filters.maxPrice };
  }
  if (filters.womenOnly) {
    where.womenOnly = true;
  }

  const [rides, total] = await Promise.all([
    db.ride.findMany({
      where,
      include: {
        driver: { select: { id: true, name: true, carModel: true, carPlate: true } },
        _count: { select: { requests: { where: { status: "ACCEPTED" } } } },
      },
      orderBy: { dateTime: "asc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    db.ride.count({ where }),
  ]);

  return {
    rides,
    total,
    totalPages: Math.ceil(total / ITEMS_PER_PAGE),
    currentPage: page,
  };
}

export async function getRideById(rideId: string) {
  return db.ride.findUnique({
    where: { id: rideId },
    include: {
      driver: {
        select: { id: true, name: true, phone: true, carModel: true, carPlate: true, bio: true, clerkId: true },
      },
      requests: {
        include: {
          passenger: { select: { id: true, name: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      messages: {
        include: {
          sender: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function requestJoinRide(input: { rideId: string; seats: number; note?: string }) {
  const user = await assertBilkentUser();
  const parsed = joinRideSchema.parse(input);

  const result = await db.$transaction(async (tx) => {
    const ride = await tx.ride.findUnique({
      where: { id: parsed.rideId },
      select: { id: true, driverId: true, seatsAvailable: true, status: true },
    });

    if (!ride) throw new Error("Ride not found");
    if (ride.status !== "ACTIVE") throw new Error("Ride is not available");
    if (ride.driverId === user.id) throw new Error("Cannot join your own ride");
    if (ride.seatsAvailable < parsed.seats) throw new Error("Not enough seats available");

    const existing = await tx.rideRequest.findUnique({
      where: { rideId_passengerId: { rideId: parsed.rideId, passengerId: user.id } },
    });

    if (existing && existing.status !== "CANCELLED" && existing.status !== "REJECTED") {
      throw new Error("You already have an active request for this ride");
    }

    if (existing) {
      return tx.rideRequest.update({
        where: { id: existing.id },
        data: { seats: parsed.seats, note: parsed.note ?? null, status: "PENDING" },
      });
    }

    return tx.rideRequest.create({
      data: {
        rideId: parsed.rideId,
        passengerId: user.id,
        seats: parsed.seats,
        note: parsed.note ?? null,
      },
    });
  });

  revalidatePath(`/rides/${input.rideId}`);
  revalidatePath("/dashboard");
  return { success: true, requestId: result.id };
}

export async function respondToRequest(requestId: string, action: "ACCEPTED" | "REJECTED") {
  const user = await assertBilkentUser();

  await db.$transaction(async (tx) => {
    const request = await tx.rideRequest.findUnique({
      where: { id: requestId },
      include: { ride: { select: { driverId: true, seatsAvailable: true, id: true } } },
    });

    if (!request) throw new Error("Request not found");
    if (request.ride.driverId !== user.id) throw new Error("Only the driver can respond");
    if (request.status !== "PENDING") throw new Error("Request is not pending");

    if (action === "ACCEPTED") {
      if (request.ride.seatsAvailable < request.seats) {
        throw new Error("Not enough seats available");
      }

      await tx.rideRequest.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" },
      });

      const newAvailable = request.ride.seatsAvailable - request.seats;
      await tx.ride.update({
        where: { id: request.rideId },
        data: {
          seatsAvailable: newAvailable,
          status: newAvailable === 0 ? "FULL" : "ACTIVE",
        },
      });
    } else {
      await tx.rideRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED" },
      });
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/rides");
}

export async function cancelRide(rideId: string) {
  const user = await assertBilkentUser();

  await db.$transaction(async (tx) => {
    const ride = await tx.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw new Error("Ride not found");
    if (ride.driverId !== user.id) throw new Error("Only the driver can cancel");

    await tx.ride.update({
      where: { id: rideId },
      data: { status: "CANCELLED" },
    });

    await tx.rideRequest.updateMany({
      where: { rideId, status: "PENDING" },
      data: { status: "CANCELLED" },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/");
}

export async function cancelRequest(requestId: string) {
  const user = await assertBilkentUser();

  await db.$transaction(async (tx) => {
    const request = await tx.rideRequest.findUnique({
      where: { id: requestId },
      include: { ride: true },
    });

    if (!request) throw new Error("Request not found");
    if (request.passengerId !== user.id) throw new Error("Not your request");

    const wasAccepted = request.status === "ACCEPTED";

    await tx.rideRequest.update({
      where: { id: requestId },
      data: { status: "CANCELLED" },
    });

    if (wasAccepted) {
      await tx.ride.update({
        where: { id: request.rideId },
        data: {
          seatsAvailable: { increment: request.seats },
          status: "ACTIVE",
        },
      });
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/rides");
}

export async function getMyRides() {
  const user = await assertBilkentUser();

  const [createdRides, joinedRequests] = await Promise.all([
    db.ride.findMany({
      where: { driverId: user.id },
      include: {
        requests: {
          include: {
            passenger: { select: { id: true, name: true } },
          },
        },
        _count: { select: { requests: { where: { status: "ACCEPTED" } } } },
      },
      orderBy: { dateTime: "desc" },
    }),
    db.rideRequest.findMany({
      where: { passengerId: user.id },
      include: {
        ride: {
          include: {
            driver: { select: { id: true, name: true, phone: true, carModel: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { createdRides, joinedRequests };
}

export async function sendMessage(rideId: string, content: string) {
  const user = await assertBilkentUser();

  if (!content.trim() || content.length > 500) {
    throw new Error("Invalid message");
  }

  const ride = await db.ride.findUnique({
    where: { id: rideId },
    include: {
      requests: { where: { passengerId: user.id, status: "ACCEPTED" } },
    },
  });

  if (!ride) throw new Error("Ride not found");

  const isDriver = ride.driverId === user.id;
  const isPassenger = ride.requests.length > 0;
  if (!isDriver && !isPassenger) {
    throw new Error("You must be the driver or an accepted passenger to message");
  }

  await db.message.create({
    data: {
      rideId,
      senderId: user.id,
      content: content.trim(),
    },
  });

  revalidatePath(`/rides/${rideId}`);
}
