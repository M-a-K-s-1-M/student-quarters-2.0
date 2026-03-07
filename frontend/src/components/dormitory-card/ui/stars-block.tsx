'use client'

import { StarIcon } from "lucide-react"

export function StartsBlock() {
    return (
        <div className="flex gap-1 backdrop-blur-xl px-3 py-2 rounded-full items-center justify-center bg-white/20 dark:bg-black/20">
            <StarIcon className="text-yellow-300" />
            <span className="text-lg text-white font-semibold">4.5</span>
        </div>
    )
}
