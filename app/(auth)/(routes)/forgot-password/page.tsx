"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import axios, { AxiosError } from "axios";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post("/api/auth/forgot-password", { email });

      if (response.data.message) {
        setIsEmailSent(true);
        toast.success("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني");
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        toast.error("لم يتم العثور على حساب بهذا البريد الإلكتروني");
      } else {
        toast.error("حدث خطأ أثناء إرسال البريد الإلكتروني");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            نسيت كلمة المرور
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEmailSent 
              ? "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني"
              : "أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور"
            }
          </p>
        </div>
        {!isEmailSent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                disabled={isLoading}
                className="h-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="w-full h-10"
              disabled={isLoading}
            >
              {isLoading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full h-10"
              onClick={() => router.push("/sign-in")}
            >
              العودة إلى تسجيل الدخول
            </Button>
          </div>
        )}
        <div className="text-center text-sm">
          <Link 
            href="/sign-in" 
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            العودة إلى تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
} 