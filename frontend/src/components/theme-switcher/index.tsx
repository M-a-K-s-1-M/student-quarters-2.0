'use client';

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Switch } from "@heroui/react";
import { MoonIcon, SunIcon } from "lucide-react";

export function ThemeSwitcher() {
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <Switch
            checked={theme === 'dark'}
            color="primary"
            size='md'
            thumbIcon={(isSelected) =>
                theme === 'dark' ? <SunIcon color="black" size={16} /> : <MoonIcon color="black" size={16} />
            }

            onChange={() => theme === 'light' ? setTheme('dark') : setTheme('light')}
        />
    )
}
