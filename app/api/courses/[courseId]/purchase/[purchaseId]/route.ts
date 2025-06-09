import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
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

    // Only allow deletion of PENDING or FAILED purchases
    if (purchase.status !== "PENDING" && purchase.status !== "FAILED") {
      return new NextResponse("Cannot delete active purchase", { status: 400 });
    }

    // Delete the associated payment if it exists
    if (purchase.payment) {
      await db.payment.delete({
        where: { id: purchase.payment.id }
      });
    }

    // Delete the purchase
    await db.purchase.delete({
      where: { id: purchase.id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[PURCHASE_DELETE] Error:", error);
    if (error instanceof Error) {
      return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
} 