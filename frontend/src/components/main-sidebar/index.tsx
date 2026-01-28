'use client'

import { siteConfig } from "@/lib"
import { cn } from "@/lib/utils";
import { GlassWrapper } from "@/shared";
import Link from "next/link"
import { usePathname } from "next/navigation";

export function MainSidebar() {
    const path = usePathname();
    console.log(path);
    return (
        <GlassWrapper className="w-15 ml-auto h-fit
            flex justify-center rounded-full">

            <nav>
                <ul className="flex flex-col gap-4">
                    {siteConfig.navLinks.map(link => {
                        const Icon = link.icon;
                        return (
                            <li key={link.name}>
                                <button className={cn(" p-4 rounded-full cursor-pointer transform transition-all duration-300", {
                                    "bg-white/20": path === link.href,

                                })}>

                                    <Link
                                        href={link.href}
                                        className="w-full h-full"
                                    >
                                        {Icon ? <Icon size={25} /> : null}
                                    </Link>
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </nav >
        </GlassWrapper >
    )
}
