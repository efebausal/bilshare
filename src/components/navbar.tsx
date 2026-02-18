"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { Car, Plus, LayoutDashboard, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const { isSignedIn } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Car className="h-5 w-5 text-primary" />
          <span>BilShare</span>
        </Link>

        {isSignedIn && (
          <nav className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/rides/new" className="gap-1.5">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Ride</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard" className="gap-1.5">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/profile" className="gap-1.5">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
            </Button>
            <ThemeToggle />
            <UserButton afterSignOutUrl="/" />
          </nav>
        )}
      </div>
    </header>
  );
}
