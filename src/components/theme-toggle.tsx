"use client"

import * as React from "react"
import { Moon, Sun, Check } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type ThemeToggleProps = {
    buttonClassName?: string
}

export function ThemeToggle({ buttonClassName }: ThemeToggleProps) {
    const { theme, setTheme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent/70 dark:hover:bg-accent/55",
                        buttonClassName
                    )}
                >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-transform duration-150 ease-out dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-transform duration-150 ease-out dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer flex justify-between items-center">
                    Light
                    {theme === "light" && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer flex justify-between items-center">
                    Dark
                    {theme === "dark" && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer flex justify-between items-center">
                    System
                    {theme === "system" && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
