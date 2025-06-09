import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string; purchaseId: string }> }
) {
  try {
    const { userId } = await auth();
    const resolvedParams = await params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find the purchase and verify ownership
    const purchase = await db.purchase.findUnique({
      where: {
        id: resolvedParams.purchaseId,
        userId,
        courseId: resolvedParams.courseId,
      },
      include: {
        payment: true
      }
    });

    if (!purchase) {
      return new NextResponse("Purchase not found", { status: 404 });
    }

    // Only allow canceling PENDING purchases
    if (purchase.status !== "PENDING") {
      return new NextResponse("Cannot cancel non-pending purchase", { status: 400 });
    }

    // Update payment status to CANCELED
    if (purchase.payment) {
      await db.payment.update({
        where: { id: purchase.payment.id },
        data: { status: "CANCELED" }
      });
    }

    // Update purchase status to FAILED
    await db.purchase.update({
      where: { id: purchase.id },
      data: { status: "FAILED" }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[PURCHASE_CANCEL] Error:", error);
    if (error instanceof Error) {
      return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
} 