export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { BilkentGate } from "@/components/bilkent-gate";
import { getRideById } from "@/actions/rides";
import { db } from "@/lib/db";
import { RideDetails } from "./ride-details";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RideDetailPage({ params }: Props) {
  const { id } = await params;
  const ride = await getRideById(id);

  if (!ride) notFound();

  const { userId } = await auth();
  let currentAppUserId: string | null = null;

  if (userId) {
    const appUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });
    currentAppUserId = appUser?.id ?? null;
  }

  return (
    <BilkentGate>
      <RideDetails ride={ride as any} currentUserId={currentAppUserId} />
    </BilkentGate>
  );
}
