import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return new NextResponse("البيانات المطلوبة غير مكتملة", { status: 400 });
    }

    // Find user with valid reset token
    const user = await db.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return new NextResponse("رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية", { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user's password, clear reset token, and verify email
    await db.user.update({
      where: { id: user.id },
      data: {
        hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        emailVerified: new Date() // Verify email since they have access to it
      }
    });

    return NextResponse.json({ message: "تم إعادة تعيين كلمة المرور بنجاح" });
  } catch (error) {
    console.error("[RESET_PASSWORD]", error);
    return new NextResponse("خطأ داخلي", { status: 500 });
  }
} 