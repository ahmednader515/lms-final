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

    console.log(`[PAYMENT_API] Checking payment status for purchase: ${resolvedParams.paymentId}`);

    // Find the purchase by ID
    const purchase = await db.purchase.findFirst({
      where: {
        id: resolvedParams.paymentId,
        userId,
      },
      include: {
        payment: true,
      },
    });

    if (!purchase) {
      console.error(`[PAYMENT_API] Purchase ${resolvedParams.paymentId} not found`);
      return new NextResponse("Purchase not found", { status: 404 });
    }

    console.log(`[PAYMENT_API] Found purchase with status: ${purchase.status}`);

    // If purchase is already ACTIVE, return success
    if (purchase.status === "ACTIVE") {
      console.log(`[PAYMENT_API] Purchase ${purchase.id} is already ACTIVE`);
      return NextResponse.json({
        id: purchase.payment?.id,
        status: "COMPLETED",
        amount: purchase.payment?.amount || 0,
        currency: purchase.payment?.currency || "EGP",
        transactionReference: purchase.payment?.transactionReference,
        createdAt: purchase.payment?.createdAt,
        purchase: {
          id: purchase.id,
          status: purchase.status,
        },
      });
    }

    // If there's no payment record, that's a problem
    if (!purchase.payment) {
      console.error(`[PAYMENT_API] No payment record found for purchase ${purchase.id}`);
      return new NextResponse("Payment record not found", { status: 404 });
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
      } else if (responseStatus === "D" || responseStatus === "E" || responseStatus === "X") {
        status = "FAILED";
        
        // Update payment status
        await db.payment.update({
          where: { id: purchase.payment.id },
          data: { status: "FAILED" },
        });

        // Update purchase status
        await db.purchase.update({
          where: { id: purchase.id },
          data: { status: "FAILED" },
        });
        
        console.log(`[PAYMENT_API] Updated purchase ${purchase.id} to FAILED`);
      }

      // Refresh purchase data
      const updatedPurchase = await db.purchase.findUnique({
        where: { id: purchase.id },
        include: { payment: true },
      });

      return NextResponse.json({
        id: updatedPurchase?.payment?.id,
        status: status,
        amount: updatedPurchase?.payment?.amount || 0,
        currency: updatedPurchase?.payment?.currency || "EGP",
        transactionReference: updatedPurchase?.payment?.transactionReference,
        createdAt: updatedPurchase?.payment?.createdAt,
        purchase: {
          id: updatedPurchase?.id,
          status: updatedPurchase?.status,
        },
      });
    } catch (error) {
      console.error("[PAYMENT_API] Error verifying payment:", error);
      // Return current status
      return NextResponse.json({
        id: purchase.payment.id,
        status: purchase.payment.status,
        amount: purchase.payment.amount,
        currency: purchase.payment.currency,
        transactionReference: purchase.payment.transactionReference,
        createdAt: purchase.payment.createdAt,
        purchase: {
          id: purchase.id,
          status: purchase.status,
        },
      });
    }
  } catch (error) {
    console.error("[PAYMENT_API] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 