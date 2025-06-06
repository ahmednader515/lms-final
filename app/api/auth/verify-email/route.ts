import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from "resend";
import { VerificationEmail } from "@/emails/verification-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (!email || !name) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Generate verification token
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification token in database
    await db.user.update({
      where: { email },
      data: {
        emailVerificationToken: token,
        emailVerificationExpires: expires,
      },
    });

    // Create verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

    // Send verification email
    await resend.emails.send({
      from: "LMS <noreply@yourdomain.com>",
      to: email,
      subject: "تحقق من بريدك الإلكتروني",
      react: VerificationEmail({
        verificationUrl,
        userName: name,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[VERIFY_EMAIL]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return new NextResponse("Missing token", { status: 400 });
    }

    // Find user with this token
    const user = await db.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return new NextResponse("Invalid or expired token", { status: 400 });
    }

    // Update user's email verification status
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[VERIFY_EMAIL]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 