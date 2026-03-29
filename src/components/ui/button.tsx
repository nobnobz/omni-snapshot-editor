import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/92",
        destructive:
          "bg-destructive text-white hover:bg-destructive/92 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:hover:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent/75 hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-accent/55",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/88",
        ghost:
          "hover:bg-accent/70 hover:text-accent-foreground dark:hover:bg-accent/55",
        link: "text-primary hover:text-primary/85",
      },
      size: {
        default: "h-10 sm:h-9 px-4 py-2 text-base sm:text-sm has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-lg px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-10 sm:h-9 gap-1.5 rounded-lg px-3 text-base sm:text-sm has-[>svg]:px-2.5",
        lg: "h-11 sm:h-10 rounded-lg px-6 text-base sm:text-sm has-[>svg]:px-4",
        icon: "size-10 sm:size-9",
        "icon-xs": "size-6 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
