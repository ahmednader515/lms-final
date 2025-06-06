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
            <div className="hidden md:flex h-[calc(100%-80px)] w-56 flex-col fixed inset-x-0 top-[80px] rtl:right-0 ltr:left-0 z-40 border-r dark:border-slate-700">
                <CourseSidebar />
            </div>
            <main className="pt-[80px] h-full md:rtl:pr-80 md:ltr:pl-80">
                {children}
            </main>
        </div>
    );
}

export default CourseLayout; 