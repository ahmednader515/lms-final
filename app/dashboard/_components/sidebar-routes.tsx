"use client";

import { BarChart, Compass, Layout, List } from "lucide-react";
import { SidebarItem } from "./sidebar-item";
import { usePathname } from "next/navigation";

const guestRoutes = [
    {
        icon: Layout,
        label: "لوحة التحكم",
        href: "/dashboard",
    },
    {
        icon: Compass,
        label: "استكشف",
        href: "/dashboard/search",
    },
];

const teacherRoutes = [
    {
        icon: List,
        label: "الدورات",
        href: "/dashboard/teacher/courses",
    },
    {
        icon: BarChart,
        label: "الاحصائيات",
        href: "/dashboard/teacher/analytics",
    },
];

export const SidebarRoutes = () => {
    const pathName = usePathname();

    const isTeacherPage = pathName?.includes("/dashboard/teacher");
    const routes = isTeacherPage ? teacherRoutes : guestRoutes;

    return (
        <div className="flex flex-col w-full pt-0">
            {routes.map((route) => (
                <SidebarItem key={route.href} icon={route.icon} label={route.label} href={route.href} />
            ))}
        </div>
    );
}