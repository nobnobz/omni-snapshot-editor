export type EditorTone = "neutral" | "info" | "success" | "warning" | "danger"

export const editorLayout = {
  dialogContent:
    "fixed left-1/2 top-1/2 w-[96vw] max-w-[calc(100%-1rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-4 shadow-2xl backdrop-blur-xl focus:outline-none z-50 transition-all duration-200 h-[calc(100dvh-1rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] max-h-[calc(100dvh-1rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] sm:h-auto sm:max-h-[92dvh] flex flex-col overflow-hidden",
  sectionCard:
    "rounded-xl border border-border bg-card/80 shadow-sm",
  panel:
    "rounded-lg border border-border bg-muted/30",
  headerTitle: "text-xl font-bold tracking-tight text-foreground",
  helperText: "text-sm text-muted-foreground leading-relaxed",
  metaText: "text-xs text-muted-foreground",
  label: "text-xs font-semibold text-muted-foreground",
} as const

export const editorAction = {
  primary: "h-10 sm:h-9 bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "h-9 border-border text-foreground/80 hover:bg-muted",
  danger: "h-9 bg-destructive text-white hover:bg-destructive/90",
  icon: "size-8",
} as const

export const editorToneBadge: Record<EditorTone, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  info: "bg-[var(--editor-info-bg)] text-[var(--editor-info-fg)] border-[var(--editor-info-border)]",
  success: "bg-[var(--editor-success-bg)] text-[var(--editor-success-fg)] border-[var(--editor-success-border)]",
  warning: "bg-[var(--editor-warning-bg)] text-[var(--editor-warning-fg)] border-[var(--editor-warning-border)]",
  danger: "bg-[var(--editor-danger-bg)] text-[var(--editor-danger-fg)] border-[var(--editor-danger-border)]",
}

export const editorNoticeTone: Record<EditorTone, string> = {
  neutral: "border-border bg-muted/40 text-foreground",
  info: "editor-tone-info",
  success: "editor-tone-success",
  warning: "editor-tone-warning",
  danger: "editor-tone-danger",
}
