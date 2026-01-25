'use client'
import { cn } from '@/lib/utils'
import './style.css'

export function NeumorphicCard({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn(className, 'card')}>{children}</div>
    )
}
