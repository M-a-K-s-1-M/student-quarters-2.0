'use client'

import { siteConfig } from "@/config";
import { Avatar, Link, Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuToggle } from "@heroui/react"
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeSwitcher } from "../theme-switcher";

export function MainHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const isActivePath = (href: string) => {
        if (href === '/') {
            return pathname === '/';
        }

        return pathname === href || pathname.startsWith(`${href}/`);
    };

    return (
        <Navbar onMenuOpenChange={setIsMenuOpen} isMenuOpen={isMenuOpen} isBordered className="mb-4">
            <NavbarContent>
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    className="sm:hidden"
                />

                <NavbarBrand>
                    <h1 className="text-xl font-semibold italic">{siteConfig.name}</h1>
                </NavbarBrand>
            </NavbarContent>

            <NavbarContent justify="center" className="hidden sm:flex gap-4">
                {siteConfig.navLinks.map(link => (
                    <NavbarItem key={link.href} isActive={isActivePath(link.href)}>
                        <Link
                            aria-current={isActivePath(link.href) ? 'page' : undefined}
                            color={isActivePath(link.href) ? 'primary' : 'foreground'}
                            href={link.href}
                        >
                            {link.name}
                        </Link>
                    </NavbarItem>
                ))}
            </NavbarContent>

            <NavbarContent justify="end">
                <ThemeSwitcher />
                <Avatar />
            </NavbarContent>

            <NavbarMenu>
                {siteConfig.navLinks.map(link => (
                    <NavbarItem key={link.href} isActive={isActivePath(link.href)}>
                        <Link
                            aria-current={isActivePath(link.href) ? 'page' : undefined}
                            color={isActivePath(link.href) ? 'primary' : 'foreground'}
                            href={link.href}
                        >
                            {link.name}
                        </Link>
                    </NavbarItem>
                ))}
            </NavbarMenu>
        </Navbar>
    )
}
