"use client";

import { HeroUIProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type ProvidersProps = {
    children: React.ReactNode;
};

const queryClient = new QueryClient();

export function Providers({ children }: ProvidersProps) {
    return (
        <HeroUIProvider>
            <QueryClientProvider client={queryClient}>
                <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    {children}
                </NextThemesProvider>
            </QueryClientProvider>
        </HeroUIProvider>
    );
}
