import { z } from "zod";

export const createRideSchema = z.object({
  origin: z.string().min(1, "Origin is required").max(200),
  destination: z.string().min(1, "Destination is required").max(200),
  dateTime: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date > new Date();
  }, "Must be a future date"),
  seatsTotal: z.number().int().min(1).max(8),
  price: z.number().min(0).max(10000).nullable().optional(),
  notes: z.string().max(500).optional(),
  meetingPoint: z.string().max(200).optional(),
  womenOnly: z.boolean().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  phone: z
    .string()
    .max(20)
    .regex(/^[+]?[\d\s()-]*$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  carModel: z.string().max(100).optional().or(z.literal("")),
  carPlate: z.string().max(20).optional().or(z.literal("")),
  bio: z.string().max(300).optional().or(z.literal("")),
});

export const joinRideSchema = z.object({
  rideId: z.string().min(1),
  seats: z.number().int().min(1).max(8),
  note: z.string().max(300).optional(),
});

export const reportSchema = z.object({
  targetId: z.string().min(1),
  rideId: z.string().optional(),
  reason: z.string().min(1, "Reason is required").max(100),
  details: z.string().max(1000).optional(),
});

export const rideFilterSchema = z.object({
  origin: z.string().optional(),
  destination: z.string().optional(),
  date: z.string().optional(),
  minSeats: z.number().int().min(1).optional(),
  maxPrice: z.number().min(0).optional(),
  womenOnly: z.boolean().optional(),
  page: z.number().int().min(1).optional(),
});

export type CreateRideInput = z.infer<typeof createRideSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type JoinRideInput = z.infer<typeof joinRideSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type RideFilterInput = z.infer<typeof rideFilterSchema>;
