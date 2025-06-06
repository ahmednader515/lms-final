"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { CheckCircle, Circle } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";

interface Chapter {
  id: string;
  title: string;
  isFree: boolean;
  userProgress: {
    isCompleted: boolean;
  }[];
}

interface CourseSidebarProps {
  course?: {
    id: string;
    title: string;
    chapters: Chapter[];
  };
}

export const CourseSidebar = ({ course }: CourseSidebarProps) => {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState<string>("");

  const fetchCourseData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const courseId = course?.id || params.courseId;
      if (!courseId) {
        throw new Error("Course ID is required");
      }
      const [chaptersResponse, courseResponse] = await Promise.all([
        axios.get(`/api/courses/${courseId}/chapters`),
        axios.get(`/api/courses/${courseId}`)
      ]);
      setChapters(chaptersResponse.data);
      setCourseTitle(courseResponse.data.title);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load course data");
    } finally {
      setLoading(false);
    }
  }, [course?.id, params.courseId]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  useEffect(() => {
    // Update selected chapter based on current path
    const currentChapterId = pathname?.split("/").pop();
    setSelectedChapterId(currentChapterId || null);
  }, [pathname]);

  const onClick = (id: string) => {
    const courseId = course?.id || params.courseId;
    if (courseId) {
      setSelectedChapterId(id);
      router.push(`/courses/${courseId}/chapters/${id}`);
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="h-full border-r flex flex-col overflow-y-auto shadow-lg">
        <div className="p-8 flex flex-col border-b">
          <h1 className="font-semibold">جاري تحميل الدورة</h1>
        </div>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full border-l flex flex-col overflow-y-auto shadow-lg w-64 md:w-80">
        <div className="p-8 flex flex-col border-b">
          <h1 className="font-semibold">حدث خطأ</h1>
        </div>
        <div className="flex items-center justify-center h-full text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full border-l flex flex-col overflow-y-auto shadow-lg w-64 md:w-80">
      <div className="p-8 flex flex-col border-b">
        <h1 className="font-semibold">{courseTitle || course?.title}</h1>
      </div>
      <div className="flex flex-col w-full">
        {chapters.map((chapter) => {
          const isSelected = selectedChapterId === chapter.id;
          const isCompleted = chapter.userProgress?.[0]?.isCompleted || false;
          
          return (
            <div
              key={chapter.id}
              className={cn(
                "flex items-center gap-x-2 text-sm font-[500] rtl:pr-4 ltr:pl-4 py-4 transition cursor-pointer",
                isSelected 
                  ? "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-white" 
                  : "text-slate-500 hover:bg-slate-300/20 hover:text-slate-600 dark:hover:bg-slate-800/50",
                isCompleted && !isSelected && "text-emerald-600 dark:text-emerald-400"
              )}
              onClick={() => onClick(chapter.id)}
            >
              {isCompleted ? (
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
              <span className="rtl:text-right ltr:text-left flex-grow mr-1">{chapter.title}</span>
              {chapter.isFree && (
                <span className="ml-4 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full dark:bg-blue-800 dark:text-blue-100">
                  مجاني
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}; 