import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from "resend";
import { OtpEmail } from "@/emails/otp-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (!email || !name) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await db.user.update({
      where: { email },
      data: {
        otp,
        otpExpires: expires,
      },
    });

    // Send OTP email
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SEND_OTP]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Find user with this OTP
    const user = await db.user.findFirst({
      where: {
        email,
        otp,
        otpExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return new NextResponse("Invalid or expired OTP", { status: 400 });
    }

    // Clear OTP after successful verification
    await db.user.update({
      where: { id: user.id },
      data: {
        otp: null,
        otpExpires: null,
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[VERIFY_OTP]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 