import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="relative flex min-h-[80vh] items-center justify-center">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>
      <div className="space-y-4">
        <SignUp />
        <p className="text-center text-sm text-muted-foreground">
          Only <strong>@bilkent.edu.tr</strong> emails are accepted.
        </p>
      </div>
    </div>
  );
}
