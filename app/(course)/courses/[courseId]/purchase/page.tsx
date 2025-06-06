"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import { use } from "react";
import { CreditCard } from "lucide-react";

interface PurchasePageProps {
  params: Promise<{
    courseId: string;
  }>;
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  chapters: {
    id: string;
    title: string;
  }[];
}

const PurchasePage = ({ params }: PurchasePageProps) => {
  const { courseId } = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get<Course>(`/api/courses/${courseId}`);
        setCourse(response.data);
      } catch (error) {
        console.error("Error fetching course:", error);
        toast.error("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const onPurchase = async () => {
    try {
      setIsProcessing(true);
      const response = await axios.post(`/api/courses/${courseId}/purchase`);
      
      // Redirect to PayTabs payment page
      window.location.href = response.data.paymentUrl;
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error("Failed to initiate payment");
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-muted-foreground">Course not found</div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{course.title}</h1>
              <p className="text-muted-foreground mt-2">{course.description}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{formatPrice(course.price || 0)}</p>
              <p className="text-sm text-muted-foreground">مرة واحدة</p>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">ما يشمل</h2>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>{course.chapters.length} فصل</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>الوصول إلى الأبد</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>شهادة الانتهاء</span>
              </li>
            </ul>
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">معلومات الدفع</h2>
            <p className="text-muted-foreground mb-4">
              ستتم توجيهك إلى PayTabs لإكمال الشراء بأمان.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <CreditCard className="h-4 w-4" />
              <span>الدفع الآمن مع PayTabs</span>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={onPurchase}
              size="lg"
              className="w-full max-w-md"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin mr-2">⚪</span>
                  يتم المعالجة...
                </>
              ) : (
                "الانتقال إلى الدفع"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchasePage; 