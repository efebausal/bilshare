"use server";

import { db } from "@/lib/db";
import { assertBilkentUser } from "@/lib/auth";
import { reportSchema, type ReportInput } from "@/lib/validations";

export async function reportUser(input: ReportInput) {
  const user = await assertBilkentUser();
  const parsed = reportSchema.parse(input);

  if (parsed.targetId === user.id) {
    throw new Error("Cannot report yourself");
  }

  const target = await db.user.findUnique({ where: { id: parsed.targetId } });
  if (!target) throw new Error("Target user not found");

  await db.report.create({
    data: {
      filerId: user.id,
      targetId: parsed.targetId,
      rideId: parsed.rideId ?? null,
      reason: parsed.reason,
      details: parsed.details ?? null,
    },
  });

  return { success: true };
}
