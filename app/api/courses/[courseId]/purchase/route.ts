import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createPaymentLink } from "@/lib/paytabs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { userId } = await auth();
    const resolvedParams = await params;

    if (!userId) {
      console.log("[PURCHASE_ERROR] No user ID found in auth");
      return new NextResponse("Unauthorized - Please sign in to make a purchase", { status: 401 });
    }

    console.log(`[PURCHASE_ATTEMPT] User ${userId} attempting to purchase course ${resolvedParams.courseId}`);

    const course = await db.course.findUnique({
      where: {
        id: resolvedParams.courseId,
        isPublished: true,
      },
    });

    if (!course) {
      console.log(`[PURCHASE_ERROR] Course ${resolvedParams.courseId} not found or not published`);
      return new NextResponse("Course not found or not available for purchase", { status: 404 });
    }

    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: resolvedParams.courseId,
        },
      },
    });

    // Only block purchase if the status is ACTIVE or PENDING
    if (purchase && (purchase.status === "ACTIVE" || purchase.status === "PENDING")) {
      console.log(`[PURCHASE_ERROR] User ${userId} already has an active or pending purchase for course ${resolvedParams.courseId}`);
      
      if (purchase.status === "ACTIVE") {
        return new NextResponse("You have already purchased this course", { status: 400 });
      } else {
        return new NextResponse("You have a pending purchase for this course. Please complete the payment or try again later.", { status: 400 });
      }
    }

    // If there's a FAILED purchase record, delete it before creating a new one
    if (purchase && purchase.status === "FAILED") {
      console.log(`[PURCHASE] Removing previous failed purchase for user ${userId}, course ${resolvedParams.courseId}`);
      
      // Delete the previous payment record if it exists
      const previousPayment = await db.payment.findFirst({
        where: { purchaseId: purchase.id }
      });
      
      if (previousPayment) {
        await db.payment.delete({
          where: { id: previousPayment.id }
        });
      }
      
      // Delete the failed purchase
      await db.purchase.delete({
        where: { id: purchase.id }
      });
    }

    // Get user information
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        name: true,
        email: true
      }
    });

    if (!user?.email) {
      console.log(`[PURCHASE_ERROR] No email found for user ${userId}`);
      return new NextResponse("Your account email is required for payment processing", { status: 400 });
    }

    // Create a new purchase record with 'pending' status
    const newPurchase = await db.purchase.create({
      data: {
        userId,
        courseId: resolvedParams.courseId,
        status: "PENDING",
      },
    });

    try {
      // Create a PayTabs payment link
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const paymentParams = {
        courseId: resolvedParams.courseId,
        courseTitle: course.title,
        amount: course.price || 0,
        customerEmail: user.email,
        customerName: user.name || "Customer",
        callbackUrl: `${baseUrl}/api/webhooks/paytabs`,
        returnUrl: `${baseUrl}/courses/${resolvedParams.courseId}/payment-status?purchaseId=${newPurchase.id}&courseId=${resolvedParams.courseId}`,
      };
      
      console.log("[PAYTABS_REQUEST] Creating payment link with params:", JSON.stringify(paymentParams, null, 2));
      
      try {
        const paymentResponse = await createPaymentLink(paymentParams);
        console.log("[PAYTABS_RESPONSE] Received response:", JSON.stringify(paymentResponse, null, 2));

        if (!paymentResponse || !paymentResponse.tran_ref || !paymentResponse.redirect_url) {
          throw new Error(`Invalid PayTabs response: ${JSON.stringify(paymentResponse)}`);
        }

        // Store payment information
        await db.payment.create({
          data: {
            transactionReference: paymentResponse.tran_ref,
            amount: course.price || 0,
            status: "PENDING",
            purchaseId: newPurchase.id,
          },
        });

        // Return the payment URL
        return NextResponse.json({
          purchaseId: newPurchase.id,
          paymentUrl: paymentResponse.redirect_url,
        });
      } catch (paymentError) {
        console.error("[PAYTABS_ERROR] Payment creation failed:", paymentError);
        // Delete the purchase if payment creation fails
        await db.purchase.delete({
          where: {
            id: newPurchase.id
          }
        });
        
        if (paymentError instanceof Error) {
          return new NextResponse(`Payment Error: ${paymentError.message}`, { status: 500 });
        }
        return new NextResponse("Failed to create payment", { status: 500 });
      }
    } catch (error) {
      console.error("[PURCHASE_ERROR] Unexpected error:", error);
      // Delete the purchase if any error occurs
      await db.purchase.delete({
        where: {
          id: newPurchase.id
        }
      });
      
      if (error instanceof Error) {
        return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
      }
      return new NextResponse("Internal Error", { status: 500 });
    }
  } catch (error) {
    console.error("[PURCHASE_ERROR] Unexpected error:", error);
    if (error instanceof Error) {
      return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
} 