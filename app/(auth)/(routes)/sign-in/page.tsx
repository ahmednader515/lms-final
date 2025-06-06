"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phoneNumber: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          toast.error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        } else if (result.error === "EmailNotVerified") {
          toast.error("يرجى التحقق من بريدك الإلكتروني أولاً");
        } else if (result.error === "Invalid phone number") {
          toast.error("رقم الهاتف غير صحيح");
        } else {
          toast.error("حدث خطأ أثناء تسجيل الدخول");
        }
        return;
      }

      toast.success("تم تسجيل الدخول بنجاح");
      router.refresh();
      router.push("/dashboard");
    } catch {
      toast.error("حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="absolute top-4 left-4">
        <Button variant="ghost" size="lg" asChild>
          <Link href="/">
            <ChevronLeft className="h-10 w-10" />
          </Link>
        </Button>
      </div>
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            تسجيل الدخول
          </h2>
          <p className="text-sm text-muted-foreground">
            أدخل بريدك الإلكتروني وكلمة المرور للدخول إلى حسابك
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isLoading}
              className="h-10"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">رقم الهاتف</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              autoComplete="tel"
              required
              disabled={isLoading}
              className="h-10"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="+20XXXXXXXXXX"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                disabled={isLoading}
                className="h-10"
                value={formData.password}
                onChange={handleInputChange}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-end">
            <Link 
              href="/forgot-password" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              نسيت كلمة المرور؟
            </Link>
          </div>
          <Button
            type="submit"
            className="w-full h-10"
            disabled={isLoading}
          >
            {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </Button>
        </form>
        <div className="text-center text-sm">
          <span className="text-muted-foreground">ليس لديك حساب؟ </span>
          <Link 
            href="/sign-up" 
            className="text-primary hover:underline transition-colors"
          >
            إنشاء حساب جديد
          </Link>
        </div>
      </div>
    </div>
  );
} 