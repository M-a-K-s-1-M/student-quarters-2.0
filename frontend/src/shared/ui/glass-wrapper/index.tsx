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
                "relative rounded-[32px] bg-linear-to-br from-white/35 to-white/10 backdrop-blur-2xl border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.12)]",
                className,
            )}
        >
            {children}
        </div>
    );
}
