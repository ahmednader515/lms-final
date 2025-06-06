import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { userId } = await auth();
    const resolvedParams = await params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get total chapters in the course
    const totalChapters = await db.chapter.count({
      where: {
        courseId: resolvedParams.courseId,
        isPublished: true,
      }
    });

    // Get completed chapters
    const completedChapters = await db.userProgress.count({
      where: {
        userId,
        chapter: {
          courseId: resolvedParams.courseId,
        },
        isCompleted: true
      }
    });

    // Calculate progress percentage
    const progress = totalChapters > 0 
      ? Math.round((completedChapters / totalChapters) * 100)
      : 0;

    return NextResponse.json({ progress });
  } catch (error) {
    console.log("[PROGRESS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 