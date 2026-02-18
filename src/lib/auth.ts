import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";

const ALLOWED_DOMAIN = "bilkent.edu.tr";

export function isBilkentEmail(email: string): boolean {
  const domain = email.toLowerCase().split("@").pop() ?? "";
  return domain === ALLOWED_DOMAIN || domain.endsWith(`.${ALLOWED_DOMAIN}`);
}

export async function getAppUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  return user;
}

export async function assertBilkentUser() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized: not signed in");
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    throw new Error("Unauthorized: no app profile found");
  }

  if (user.blocked) {
    throw new Error("Unauthorized: account is blocked");
  }

  return user;
}

export async function ensureAppUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (existing) return existing;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const primaryEmail = clerkUser.emailAddresses.find(
    (e) => e.id === clerkUser.primaryEmailAddressId
  )?.emailAddress;

  if (!primaryEmail || !isBilkentEmail(primaryEmail)) {
    return null;
  }

  const verified = clerkUser.emailAddresses.find(
    (e) => e.id === clerkUser.primaryEmailAddressId
  )?.verification?.status;

  if (verified !== "verified") {
    return null;
  }

  return db.user.create({
    data: {
      clerkId: userId,
      email: primaryEmail,
      name:
        `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
        primaryEmail.split("@")[0],
    },
  });
}
