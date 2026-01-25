"use client";

import type { ComponentType } from "react";
import type { AnimatedIconProps } from "@/components-shadcn-ui/ui/types";

import HomeIcon from "@/components-shadcn-ui/ui/home-icon";
import UserIcon from "@/components-shadcn-ui/ui/user-icon";
import LayoutBottombarCollapseIcon from "@/components-shadcn-ui/ui/layout-bottombar-collapse-icon";

export type NavLink = {
    name: string;
    href: string;
    icon?: ComponentType<AnimatedIconProps>;
};

export const siteConfig = {
    name: "Student Quarters",
    description: "Найди своё идеальное общежитие вместе с Student Quarters!",

    navLinks: [
        { name: "Главная", href: "/", icon: HomeIcon },
        { name: "Общежития", href: "/dormitories", icon: LayoutBottombarCollapseIcon },
        { name: "Профиль", href: "/profile", icon: UserIcon },
    ]
} satisfies {
    name: string;
    description: string;
    navLinks: NavLink[];
};