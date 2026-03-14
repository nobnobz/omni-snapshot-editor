"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch inline-flex shrink-0 items-center rounded-full border shadow-xs transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:border-primary/35 data-[state=checked]:bg-primary data-[state=unchecked]:border-border data-[state=unchecked]:bg-muted data-[state=unchecked]:hover:border-border/90 data-[state=unchecked]:hover:bg-muted/80 dark:data-[state=unchecked]:border-border/70 dark:data-[state=unchecked]:bg-input/70 dark:data-[state=unchecked]:hover:border-white/12 dark:data-[state=unchecked]:hover:bg-input/85",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-[0_1px_2px_rgba(15,23,42,0.12)] ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground dark:shadow-none"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
