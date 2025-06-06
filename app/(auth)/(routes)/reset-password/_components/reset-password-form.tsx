"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";
import { Check, X, Eye, EyeOff } from "lucide-react";

export const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePassword = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    return {
      ...checks,
      isValid: Object.values(checks).every(Boolean),
    };
  };

  const passwordChecks = validatePassword(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!passwordChecks.isValid) {
      toast.error("كلمة المرور لا تلبي المتطلبات");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("كلمات المرور غير متطابقة");
      setIsLoading(false);
      return;
    }

    try {
      await axios.post("/api/auth/reset-password", {
        token,
        password: formData.password,
      });

      toast.success("تم إعادة تعيين كلمة المرور بنجاح");
      router.push("/sign-in");
    } catch {
      toast.error("حدث خطأ أثناء إعادة تعيين كلمة المرور");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-foreground">رابط غير صالح</h1>
          <p className="mb-4 text-muted-foreground">رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية.</p>
          <Button onClick={() => router.push("/forgot-password")}>
            طلب رابط جديد
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">إعادة تعيين كلمة المرور</h1>
          <p className="mt-2 text-muted-foreground">أدخل كلمة المرور الجديدة</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="mt-1"
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

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {passwordChecks.length ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm text-muted-foreground">8 أحرف على الأقل</span>
              </div>
              <div className="flex items-center gap-2">
                {passwordChecks.uppercase ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm text-muted-foreground">حرف كبير واحد على الأقل</span>
              </div>
              <div className="flex items-center gap-2">
                {passwordChecks.lowercase ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm text-muted-foreground">حرف صغير واحد على الأقل</span>
              </div>
              <div className="flex items-center gap-2">
                {passwordChecks.number ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm text-muted-foreground">رقم واحد على الأقل</span>
              </div>
              <div className="flex items-center gap-2">
                {passwordChecks.special ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm text-muted-foreground">رمز خاص واحد على الأقل</span>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="mt-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !passwordChecks.isValid}
            className="w-full"
          >
            {isLoading ? "جاري إعادة التعيين..." : "إعادة تعيين كلمة المرور"}
          </Button>
        </form>
      </div>
    </div>
  );
}; 