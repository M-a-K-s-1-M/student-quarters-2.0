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
        <GlassWrapper className="w-20 ml-auto h-fit py-6
            flex justify-center rounded-full">

            <nav>
                <ul className="flex flex-col gap-4">
                    {siteConfig.navLinks.map(link => {
                        const Icon = link.icon;
                        return (
                            <li key={link.name}>
                                <button className={cn(" p-3 rounded-full cursor-pointer hover:bg-foreground/20 transition-colors duration-300", {
                                    "bg-foreground/30": path === link.href,

                                })}>

                                    <Link
                                        href={link.href}
                                        className="w-full h-full"
                                    >
                                        {Icon ? <Icon size={30} /> : null}
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
