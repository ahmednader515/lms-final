"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

interface PaymentResponse {
  status: "COMPLETED" | "FAILED" | "PENDING";
  purchase?: {
    status: "ACTIVE" | "FAILED" | "PENDING";
  };
}

const PaymentStatusPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeParams = useParams();
  const purchaseId = searchParams.get("purchaseId");
  const courseId = searchParams.get("courseId") || routeParams.courseId;
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [checkCount, setCheckCount] = useState(0);
  const MAX_CHECKS = 12;

  useEffect(() => {
    if (!purchaseId || !courseId) {
      console.error("[PAYMENT_STATUS] Missing purchaseId or courseId");
      setStatus("error");
      return;
    }

    let isMounted = true;

    const checkPaymentStatus = async () => {
      try {
        console.log(`[PAYMENT_STATUS] Check #${checkCount + 1} for purchaseId: ${purchaseId}`);
        
        // Check payment status from our database
        const response = await axios.get<PaymentResponse>(`/api/payments/${purchaseId}`);
        console.log("[PAYMENT_STATUS] Response:", response.data);
        
        if (!isMounted) return false;

        if (response.data.status === "COMPLETED" || 
            response.data.purchase?.status === "ACTIVE") {
          console.log("[PAYMENT_STATUS] Payment verified as completed");
          setStatus("success");
          // Add a small delay before redirecting to ensure the status is shown
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
          return true;
        } else if (response.data.status === "FAILED" || 
                  response.data.purchase?.status === "FAILED") {
          console.log("[PAYMENT_STATUS] Payment verified as failed");
          setStatus("error");
          return true;
        } else {
          console.log("[PAYMENT_STATUS] Payment still pending, continuing checks");
          return false;
        }
      } catch (error) {
        console.error("[PAYMENT_STATUS] Error checking payment status:", error);
        if (isMounted) {
          return false;
        }
        return false;
      }
    };

    const setupChecks = async () => {
      const verified = await checkPaymentStatus();
      if (!isMounted) return;
      
      setCheckCount(prev => prev + 1);
      
      if (verified) return;
      
      const intervalId = setInterval(async () => {
        const verified = await checkPaymentStatus();
        if (!isMounted) return;
        
        setCheckCount(c => c + 1);
        
        if (verified || checkCount >= MAX_CHECKS - 1) {
          clearInterval(intervalId);
          if (checkCount >= MAX_CHECKS - 1 && !verified && isMounted) {
            console.log("[PAYMENT_STATUS] Max check attempts reached, setting error");
            setStatus("error");
          }
        }
      }, 5000);
      
      return () => {
        clearInterval(intervalId);
        isMounted = false;
      };
    };
    
    const cleanup = setupChecks();
    return () => {
      cleanup?.then(cleanupFn => cleanupFn?.());
      isMounted = false;
    };
  }, [purchaseId, courseId, checkCount, router]);

  const handleTryAgain = () => {
    router.push(`/courses/${courseId}/purchase`);
  };

  if (status === "loading") {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2">يتم تأكيد عملية الدفع</h1>
          <p className="text-muted-foreground">الرجاء الأنتظار حتي نتأكد من عملية الدفع</p>
          <p className="text-xs text-muted-foreground mt-2">محاولة التأكد: {checkCount}/{MAX_CHECKS}</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">تم الدفع بنجاح!</h1>
          <p className="text-muted-foreground mb-6">
              تمت معالجة دفعتك بنجاح. لديك الآن وصول كامل إلى الدورة.
          </p>
          <Button onClick={handleTryAgain} size="lg" className="w-full">
            حاول مرة اخري
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">فشل الدفع</h1>
        <p className="text-muted-foreground mb-6">
        تعذّر علينا معالجة دفعتك. يرجى المحاولة مرة أخرى أو التواصل مع الدعم إذا استمرت المشكلة.
        </p>
        <Button onClick={handleTryAgain} size="lg" className="w-full">
          حاول مرة اخري
        </Button>
      </div>
    </div>
  );
};

export default PaymentStatusPage; 