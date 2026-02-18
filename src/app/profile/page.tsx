import { BilkentGate } from "@/components/bilkent-gate";
import { assertBilkentUser } from "@/lib/auth";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await assertBilkentUser();

  return (
    <BilkentGate>
      <ProfileForm
        initialData={{
          name: user.name,
          phone: user.phone ?? "",
          carModel: user.carModel ?? "",
          carPlate: user.carPlate ?? "",
          bio: user.bio ?? "",
        }}
      />
    </BilkentGate>
  );
}
