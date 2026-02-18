import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="space-y-4">
        <SignUp />
        <p className="text-center text-sm text-muted-foreground">
          Only <strong>@bilkent.edu.tr</strong> emails are accepted.
        </p>
      </div>
    </div>
  );
}
