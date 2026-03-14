export const uiChrome = {
  overlaySurface:
    "rounded-xl border border-border/70 bg-popover/95 text-popover-foreground shadow-[0_20px_48px_rgba(15,23,42,0.16)] backdrop-blur-2xl dark:bg-popover/92 dark:shadow-[0_24px_56px_rgba(0,0,0,0.55)]",
  overlaySection: "border-b border-border/60 bg-muted/35",
  overlayList: "bg-[var(--editor-list-surface)]",
  overlayItemInteractive:
    "outline-none transition-[background-color,color] duration-150 ease-out hover:bg-accent/70 hover:text-accent-foreground data-[highlighted]:bg-accent/75 data-[highlighted]:text-accent-foreground focus:bg-accent/75 focus:text-accent-foreground data-[state=open]:bg-accent/75 data-[state=open]:text-accent-foreground dark:hover:bg-accent/55 dark:data-[highlighted]:bg-accent/55 dark:focus:bg-accent/55 dark:data-[state=open]:bg-accent/55",
  scrim:
    "fixed inset-0 z-50 bg-black/38 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 dark:bg-black/58",
  modalContent:
    "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border border-border/70 bg-popover/95 p-6 text-popover-foreground shadow-[0_24px_56px_rgba(15,23,42,0.18)] backdrop-blur-2xl duration-200 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 dark:bg-popover/92 dark:shadow-[0_24px_56px_rgba(0,0,0,0.55)]",
  modalClose:
    "absolute top-4 right-4 rounded-lg border border-border/70 bg-background/70 p-1.5 text-foreground/60 ring-offset-background transition-[background-color,color,border-color] hover:bg-accent/70 hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none data-[state=open]:bg-accent/70 data-[state=open]:text-foreground",
} as const

export const uiControl = {
  field: "h-10 sm:h-9 text-base sm:text-sm",
  fieldCompact: "h-10 sm:h-8 text-base sm:text-sm",
  fieldTouch: "h-10 text-base sm:text-sm",
  searchField: "pl-8 h-10 sm:h-9 text-base sm:text-sm",
  listItem: "rounded-lg px-2.5 py-2 text-sm",
} as const

export const uiAction = {
  primary:
    "transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out bg-primary text-primary-foreground hover:bg-primary/92",
  accentGhost:
    "transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out text-primary hover:text-primary hover:bg-primary/10",
  subtleGhost:
    "transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out text-foreground/70 hover:text-foreground hover:bg-accent/70",
} as const
