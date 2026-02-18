"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertBilkentUser } from "@/lib/auth";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations";

export async function updateProfile(input: UpdateProfileInput) {
  const user = await assertBilkentUser();
  const parsed = updateProfileSchema.parse(input);

  await db.user.update({
    where: { id: user.id },
    data: {
      name: parsed.name,
      phone: parsed.phone || null,
      carModel: parsed.carModel || null,
      carPlate: parsed.carPlate || null,
      bio: parsed.bio || null,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getProfile() {
  return assertBilkentUser();
}
