import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { Resend } from "resend";
import { OtpEmail } from "@/emails/otp-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, password, name, phoneNumber } = await req.json();

    if (!email || !password || !name || !phoneNumber) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email },
          { phoneNumber }
        ]
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return new NextResponse("Email already exists", { status: 400 });
      }
      if (existingUser.phoneNumber === phoneNumber) {
        return new NextResponse("Phone number already exists", { status: 400 });
      }
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Try to send OTP email first
    const { error } = await resend.emails.send({
      from: "LMS <onboarding@resend.dev>",
      to: email,
      subject: "رمز التحقق الخاص بك",
      react: OtpEmail({
        otp,
        userName: name,
      }),
    });

    if (error) {
      console.error("[EMAIL_ERROR]", error);
      return new NextResponse("Failed to send verification email", { status: 500 });
    }

    // Only create user if email was sent successfully
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await db.user.create({
      data: {
        email,
        name,
        phoneNumber,
        hashedPassword,
        role: "USER",
        otp,
        otpExpires: expires,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[REGISTER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 