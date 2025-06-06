"use client";

import { CourseNavbar } from "./_components/course-navbar";
import { CourseSidebar } from "./_components/course-sidebar";

const CourseLayout = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return (
        <div className="h-full">
            <div className="h-[80px] fixed inset-x-0 top-0 w-full z-50">
                <CourseNavbar />
            </div>
            <div className="hidden md:flex h-[calc(100%-80px)] w-64 md:w-80 flex-col fixed inset-y-0 top-[80px] right-0 z-40 border-l dark:border-slate-700">
                <CourseSidebar />
            </div>
            <main className="pt-[80px] h-full md:pr-64 md:lg:pr-80">
                {children}
            </main>
        </div>
    );
}

export default CourseLayout; 