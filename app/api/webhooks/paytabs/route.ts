import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPayment } from "@/lib/paytabs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log("[PAYTABS_WEBHOOK] Received webhook:", JSON.stringify(body, null, 2));
    
    // Verify that this is a valid PayTabs callback
    const { tran_ref, respStatus, respCode } = body;

    if (!tran_ref) {
      console.error("[PAYTABS_WEBHOOK] Missing transaction reference");
      return new NextResponse("Missing transaction reference", { status: 400 });
    }

    console.log(`[PAYTABS_WEBHOOK] Processing transaction: ${tran_ref}`);

    // Verify payment with PayTabs
    await verifyPayment(tran_ref);
    
    // Find the corresponding payment in our database
    const payment = await db.payment.findUnique({
      where: {
        transactionReference: tran_ref,
      },
      include: {
        purchase: true,
      },
    });

    if (!payment) {
      console.error(`[PAYTABS_WEBHOOK] Payment not found for transaction: ${tran_ref}`);
      return new NextResponse("Payment not found", { status: 404 });
    }

    console.log(`[PAYTABS_WEBHOOK] Found payment record: ${payment.id}, current status: ${payment.status}`);

    // Update payment status based on PayTabs response
    let status = "FAILED"; // Default to FAILED for safety
    
    if (respStatus === "A" && (respCode === "000" || respCode === "100")) {
      status = "COMPLETED";
    } else if (respStatus === "H") {
      status = "PENDING";
    } else {
      status = "FAILED";
    }

    console.log(`[PAYTABS_WEBHOOK] Setting payment status to: ${status}`);

    // Update the payment status
    await db.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status,
      },
    });

    // If payment is successful, update the purchase status to ACTIVE
    if (status === "COMPLETED") {
      console.log(`[PAYTABS_WEBHOOK] Setting purchase ${payment.purchase.id} to ACTIVE`);
      await db.purchase.update({
        where: {
          id: payment.purchase.id,
        },
        data: {
          status: "ACTIVE",
        },
      });
      console.log(`[PAYTABS_WEBHOOK] Purchase updated to ACTIVE`);
    } else if (status === "FAILED") {
      // If payment failed, update the purchase status to FAILED
      console.log(`[PAYTABS_WEBHOOK] Setting purchase ${payment.purchase.id} to FAILED`);
      await db.purchase.update({
        where: {
          id: payment.purchase.id,
        },
        data: {
          status: "FAILED",
        },
      });
      console.log(`[PAYTABS_WEBHOOK] Purchase updated to FAILED`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PAYTABS_WEBHOOK]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 