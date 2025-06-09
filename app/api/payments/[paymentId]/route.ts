import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifyPayment } from "@/lib/paytabs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { userId } = await auth();
    const resolvedParams = await params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find the purchase by ID
    const purchase = await db.purchase.findUnique({
      where: {
        id: resolvedParams.paymentId,
      },
      include: {
        payment: true
      }
    });

    if (!purchase) {
      console.log(`[PAYMENT_API] No purchase found for ID: ${resolvedParams.paymentId}`);
      return new NextResponse("Purchase not found", { status: 404 });
    }

    // Verify that the purchase belongs to the current user
    if (purchase.userId !== userId) {
      console.log(`[PAYMENT_API] Purchase ${purchase.id} does not belong to user ${userId}`);
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!purchase.payment) {
      console.log(`[PAYMENT_API] No payment found for purchase: ${purchase.id}`);
      return new NextResponse("Payment not found", { status: 404 });
    }

    // Try to verify payment with PayTabs
    try {
      console.log(`[PAYMENT_API] Verifying payment ${purchase.payment.transactionReference} with PayTabs`);
      const paymentDetails = await verifyPayment(purchase.payment.transactionReference);
      console.log("[PAYMENT_API] Verification result:", JSON.stringify(paymentDetails, null, 2));

      // Check PayTabs response for payment status
      const responseStatus = paymentDetails?.payment_result?.response_status;
      console.log(`[PAYMENT_API] PayTabs response status: ${responseStatus}`);
      
      let status = purchase.payment.status;

      if (responseStatus === "A") {
        status = "COMPLETED";
        
        // Update payment status
        await db.payment.update({
          where: { id: purchase.payment.id },
          data: { status: "COMPLETED" },
        });

        // Update purchase status
        await db.purchase.update({
          where: { id: purchase.id },
          data: { status: "ACTIVE" },
        });
        
        console.log(`[PAYMENT_API] Updated purchase ${purchase.id} to ACTIVE`);
      } else if (responseStatus === "D" || responseStatus === "E" || responseStatus === "X" || responseStatus === "C") {
        status = responseStatus === "C" ? "CANCELED" : "FAILED";
        
        // Update payment status
        await db.payment.update({
          where: { id: purchase.payment.id },
          data: { status },
        });

        // Update purchase status
        await db.purchase.update({
          where: { id: purchase.id },
          data: { status: "FAILED" },
        });
        
        console.log(`[PAYMENT_API] Updated purchase ${purchase.id} to FAILED (payment ${status})`);
      }

      // Return the current status
      return NextResponse.json({
        status: status,
        purchase: {
          status: purchase.status
        }
      });
    } catch (error) {
      console.error("[PAYMENT_API] Error verifying payment:", error);
      // Return the current status even if verification fails
      return NextResponse.json({
        status: purchase.payment.status,
        purchase: {
          status: purchase.status
        }
      });
    }
  } catch (error) {
    console.error("[PAYMENT_API] Error:", error);
    if (error instanceof Error) {
      return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
} 