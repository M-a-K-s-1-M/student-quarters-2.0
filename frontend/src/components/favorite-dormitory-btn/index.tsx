'use client'

import { Button } from "@heroui/react"
import { Heart } from "lucide-react"

export function FavoriteDormitoryBtn() {
    return (
        <Button size="lg" isIconOnly aria-label="Like" className="backdrop-blur-md bg-red-500/70 dark:bg-black/20">
            <Heart size={28} color="white" />
        </Button>
    )
}
