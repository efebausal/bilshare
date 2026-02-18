import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { db } from "@/lib/db";
import { isBilkentEmail } from "@/lib/auth";

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses: { email_address: string; id: string; verification: { status: string } }[];
    primary_email_address_id: string;
    first_name: string | null;
    last_name: string | null;
  };
};

export async function POST(req: Request) {
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  let event: ClerkWebhookEvent;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const { id: clerkId, email_addresses, primary_email_address_id, first_name, last_name } =
      event.data;

    const primaryEmail = email_addresses.find(
      (e) => e.id === primary_email_address_id
    );

    if (!primaryEmail) {
      return NextResponse.json({ received: true });
    }

    const email = primaryEmail.email_address;

    if (!isBilkentEmail(email)) {
      console.log(`Non-Bilkent email attempted registration: ${email}`);
      return NextResponse.json({ received: true });
    }

    if (primaryEmail.verification?.status !== "verified") {
      return NextResponse.json({ received: true });
    }

    const name = `${first_name ?? ""} ${last_name ?? ""}`.trim() || email.split("@")[0];

    await db.user.upsert({
      where: { clerkId },
      update: { email, name },
      create: { clerkId, email, name },
    });
  }

  if (event.type === "user.deleted") {
    const clerkId = event.data.id;
    await db.user.deleteMany({ where: { clerkId } });
  }

  return NextResponse.json({ received: true });
}
