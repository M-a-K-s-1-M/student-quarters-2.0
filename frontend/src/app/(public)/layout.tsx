"use client"

import { MainHeader, MainSidebar } from "@/components";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <section className="min-h-screen max-w-7xl mx-auto grid grid-cols-[60px_1fr] gap-6 p-6">

                <MainSidebar />

                <main className="min-h-full">

                    <MainHeader />

                    <section className="">

                        {children}
                    </section>
                </main>
            </section>
        </>
    )
}
