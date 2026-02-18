import { ensureAppUser } from "@/lib/auth";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function BilkentGate({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const appUser = await ensureAppUser();

  if (!appUser) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <span className="text-3xl">🚫</span>
          </div>
          <h2 className="mb-2 text-xl font-semibold">Bilkent Email Required</h2>
          <p className="mb-4 text-muted-foreground">
            BilShare is exclusively for Bilkent University students. Please sign
            up with your <strong>@bilkent.edu.tr</strong> email address.
          </p>
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, make sure your primary email is a
            verified Bilkent email.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
