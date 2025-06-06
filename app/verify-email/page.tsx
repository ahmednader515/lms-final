"use client";

import { Suspense } from "react";
import { VerifyEmailForm } from "./_components/verify-email-form";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-8 p-8">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              جاري التحقق من البريد الإلكتروني...
            </h2>
            <p className="text-sm text-muted-foreground">
              يرجى الانتظار...
            </p>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
} 