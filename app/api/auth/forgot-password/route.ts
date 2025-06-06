import { NextResponse } from "next/server";
import { Resend } from "resend";
import { ResetPasswordEmail } from "@/emails/reset-password-email";
import { db } from "@/lib/db";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new NextResponse("البريد الإلكتروني مطلوب", { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      return new NextResponse("لم يتم العثور على المستخدم", { status: 404 });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with reset token
    await db.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    // Send reset password email
    const { error } = await resend.emails.send({
      from: "LMS <onboarding@resend.dev>",
      to: email,
      subject: "إعادة تعيين كلمة المرور",
      react: ResetPasswordEmail({
        resetUrl,
        userName: user.name || "المستخدم"
      })
    });

    if (error) {
      console.error("Error sending reset password email:", error);
      return new NextResponse("فشل في إرسال بريد إعادة تعيين كلمة المرور", { status: 500 });
    }

    return NextResponse.json({ message: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني" });
  } catch (error) {
    console.error("[FORGOT_PASSWORD]", error);
    return new NextResponse("خطأ داخلي", { status: 500 });
  }
} 