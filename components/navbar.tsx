"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useSession } from "next-auth/react";
import { ScrollProgress } from "@/components/scroll-progress";

export const Navbar = () => {
  const { data: session } = useSession();

  return (
    <div className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={60}
              height={60}
              className="ml-2"
            />
          </Link>

          {/* Right side items */}
          <div className="flex items-center gap-4">
            <ModeToggle />
            {!session ? (
              <>
                <Button className="bg-[#BC8B26] hover:bg-[#BC8B26]/90 text-white" asChild>
                  <Link href="/sign-up">انشاء الحساب</Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="border-[#BC8B26] dark:border-[#BC8B26] text-[#BC8B26] dark:text-[#BC8B26] hover:bg-[#BC8B26]/10"
                >
                  <Link href="/sign-in">تسجيل الدخول</Link>
                </Button>
              </>
            ) : (
              <Button variant="ghost" asChild>
                <Link href="/dashboard">لوحة التحكم</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
      <ScrollProgress />
    </div>
  );
}; 