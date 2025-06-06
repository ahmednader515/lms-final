"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const VerifyEmailForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        toast.error("رمز التحقق غير صالح");
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          throw new Error("فشل التحقق من البريد الإلكتروني");
        }

        setIsVerified(true);
        toast.success("تم التحقق من البريد الإلكتروني بنجاح");
      } catch {
        toast.error("فشل التحقق من البريد الإلكتروني");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            {isVerifying
              ? "جاري التحقق من البريد الإلكتروني..."
              : isVerified
              ? "تم التحقق من البريد الإلكتروني"
              : "فشل التحقق من البريد الإلكتروني"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isVerifying
              ? "يرجى الانتظار..."
              : isVerified
              ? "يمكنك الآن تسجيل الدخول إلى حسابك"
              : "يرجى المحاولة مرة أخرى"}
          </p>
        </div>
        {!isVerifying && (
          <Button
            onClick={() => router.push("/sign-in")}
            className="w-full"
          >
            {isVerified ? "تسجيل الدخول" : "العودة إلى تسجيل الدخول"}
          </Button>
        )}
      </div>
    </div>
  );
}; 