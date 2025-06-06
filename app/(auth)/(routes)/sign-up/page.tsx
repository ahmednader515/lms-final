"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { Check, X, Eye, EyeOff, ChevronLeft } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    name: "",
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!passwordChecks.isValid) {
      toast.error("كلمة المرور لا تلبي المتطلبات");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("/api/auth/register", formData);
      
      if (response.data.success) {
        setUserEmail(formData.email);
        setShowOtpInput(true);
        toast.success("تم إرسال رمز التحقق إلى بريدك الإلكتروني");
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 409) {
        toast.error("البريد الإلكتروني مسجل مسبقاً");
      } else {
        toast.error("حدث خطأ أثناء إنشاء الحساب");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.put("/api/auth/otp", {
        email: userEmail,
        otp,
      });

      if (response.data.success) {
        toast.success("تم التحقق من بريدك الإلكتروني بنجاح");
        router.push("/sign-in");
      }
    } catch {
      toast.error("رمز التحقق غير صالح أو منتهي الصلاحية");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);

    try {
      const response = await axios.post("/api/auth/otp", {
        email: userEmail,
        name: formData.name,
      });

      if (response.data.success) {
        toast.success("تم إعادة إرسال رمز التحقق");
      }
    } catch {
      toast.error("حدث خطأ أثناء إعادة إرسال رمز التحقق");
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
            {showOtpInput ? "التحقق من البريد الإلكتروني" : "إنشاء حساب جديد"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {showOtpInput 
              ? "أدخل رمز التحقق المرسل إلى بريدك الإلكتروني"
              : "أدخل بياناتك لإنشاء حساب جديد"
            }
          </p>
        </div>
        {!showOtpInput ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم</Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                disabled={isLoading}
                className="h-10"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
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
                  autoComplete="new-password"
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

            <Button
              type="submit"
              className="w-full h-10"
              disabled={isLoading || !passwordChecks.isValid}
            >
              {isLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">رمز التحقق</Label>
              <Input
                id="otp"
                type="text"
                required
                disabled={isLoading}
                className="h-10"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="أدخل رمز التحقق المكون من 6 أرقام"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-10"
              disabled={isLoading}
            >
              {isLoading ? "جاري التحقق..." : "تحقق"}
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={handleResendOtp}
              disabled={isLoading}
            >
              إعادة إرسال رمز التحقق
            </Button>
          </form>
        )}
        <div className="text-center text-sm">
          <span className="text-muted-foreground">لديك حساب بالفعل؟ </span>
          <Link 
            href="/sign-in" 
            className="text-primary hover:underline transition-colors"
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
} 