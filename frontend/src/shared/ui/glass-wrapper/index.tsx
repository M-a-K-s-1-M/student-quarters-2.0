import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type GlassProps = {
    children: ReactNode;
    className?: string;
};

export function GlassWrapper({ children, className = "" }: GlassProps) {
    return (
        <div
            className={cn(
                "relative bg-white/20 backdrop-blur-md border border-white/30 shadow-[0_4px_6px_rgba(0,0,0,0.1)]",
                className,
            )}
        >
            {children}
        </div>
    );
}
