import { uiAction, uiChrome, uiControl } from "@/lib/ui-style-tokens"

export type EditorTone = "neutral" | "info" | "success" | "warning" | "danger"

const editorListSurface = `!bg-none ${uiChrome.overlayList}`

export const editorLayout = {
  dialogContent:
    "fixed left-1/2 top-[env(safe-area-inset-top)] w-full max-w-full -translate-x-1/2 rounded-t-none rounded-b-3xl border-x-0 border-t-0 border-b border-slate-200 bg-white p-4 shadow-[0_24px_56px_rgba(15,23,42,0.22)] backdrop-blur-2xl focus:outline-none z-50 transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-200 ease-out dark:border-white/10 dark:bg-[#090b11] dark:shadow-[0_24px_56px_rgba(0,0,0,0.64)] h-auto max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex flex-col overflow-hidden sm:top-1/2 sm:-translate-y-1/2 sm:w-auto sm:max-h-[92dvh] sm:rounded-xl sm:max-w-6xl sm:border sm:w-[94vw] sm:bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95))] sm:dark:bg-[linear-gradient(180deg,rgba(10,12,18,0.97),rgba(7,9,14,0.99))]",
  sectionCard:
    "rounded-xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(248,250,252,0.6))] shadow-[0_10px_24px_rgba(15,23,42,0.05)] backdrop-blur-md dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(23,26,33,0.86),rgba(20,23,29,0.84))] dark:shadow-[0_8px_18px_rgba(2,6,23,0.1)]",
  panel:
    "rounded-lg border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.56),rgba(241,245,249,0.46))] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-sm dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(21,24,30,0.88),rgba(19,22,28,0.86))] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]",
  headerTitle: "text-xl font-bold tracking-tight text-foreground",
  helperText: "text-sm text-muted-foreground leading-relaxed",
  metaText: "text-xs text-muted-foreground",
  label: "text-xs font-semibold text-muted-foreground",
} as const

export const editorSurface = {
  card:
    "rounded-xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.66),rgba(248,250,252,0.54))] shadow-[0_8px_22px_rgba(15,23,42,0.045)] backdrop-blur-md dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(23,26,33,0.9),rgba(20,23,29,0.88))] dark:shadow-[0_8px_18px_rgba(2,6,23,0.1)]",
  cardInteractive:
    "rounded-xl border border-slate-200/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.64),rgba(248,250,252,0.52))] shadow-[0_8px_18px_rgba(15,23,42,0.045)] backdrop-blur-md transition-[border-color,background-color,box-shadow] hover:border-slate-300/90 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(248,250,252,0.6))] dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(23,26,33,0.9),rgba(20,23,29,0.88))] dark:hover:border-white/10 dark:hover:bg-[linear-gradient(180deg,rgba(25,29,36,0.9),rgba(21,24,30,0.88))] dark:shadow-[0_8px_18px_rgba(2,6,23,0.1)]",
  panel:
    "rounded-lg border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.56),rgba(241,245,249,0.46))] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-sm dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(20,23,29,0.9),rgba(18,21,27,0.88))] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]",
  inset:
    "rounded-xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.5),rgba(241,245,249,0.38))] shadow-[inset_0_1px_0_rgba(255,255,255,0.62)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(19,22,28,0.9),rgba(17,20,26,0.88))] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
  listSurface: editorListSurface,
  insetSticky: editorListSurface,
  dropzone:
    "rounded-xl border border-dashed border-slate-300/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.38),rgba(241,245,249,0.22))] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:border-white/12 dark:bg-[linear-gradient(180deg,rgba(18,21,27,0.9),rgba(16,19,25,0.88))] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]",
  toolbar:
    "rounded-xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.62),rgba(248,250,252,0.52))] shadow-[0_6px_16px_rgba(15,23,42,0.04)] backdrop-blur-md dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(20,23,29,0.9),rgba(17,20,26,0.88))] dark:shadow-[0_7px_16px_rgba(2,6,23,0.1)]",
  field:
    "border-slate-200/85 bg-white/52 shadow-[inset_0_1px_0_rgba(255,255,255,0.68)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(18,21,27,0.92),rgba(16,19,25,0.9))] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
  sticky: editorListSurface,
  overlay:
    uiChrome.overlaySurface,
  overlaySection:
    uiChrome.overlaySection,
  overlayList: editorListSurface,
} as const

export const editorHover = {
  transition:
    "transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out",
  softAction:
    "text-foreground/70 hover:text-foreground hover:bg-muted/60 dark:hover:bg-muted/40",
  softActionStrong:
    "text-foreground/80 hover:text-foreground hover:bg-muted/75 dark:hover:bg-muted/45",
  iconAction:
    "text-foreground/70 hover:text-foreground hover:bg-muted/65 dark:hover:bg-muted/45 border border-transparent hover:border-border/60",
  iconDanger:
    "transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out text-foreground/70 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30",
  row:
    "hover:bg-muted/28 hover:border-border/74 dark:hover:bg-muted/19 dark:hover:border-white/10",
  rowSubtle:
    "hover:bg-muted/22 dark:hover:bg-muted/16",
  panel:
    "hover:bg-muted/28 hover:border-border/74 dark:hover:bg-muted/18",
  lift:
    "hover:-translate-y-px",
  premiumCard:
    "lg:hover:-translate-y-px lg:hover:shadow-[0_14px_30px_rgba(15,23,42,0.12)] dark:lg:hover:shadow-[0_18px_36px_rgba(2,6,23,0.34)]",
} as const

export const editorAction = {
  primary:
    `${uiControl.field} ${uiAction.primary} shadow-[0_10px_24px_rgba(2,6,23,0.16)]`,
  secondary:
    "h-9 border-border text-foreground/80 transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out hover:bg-muted/80",
  danger:
    "h-9 bg-destructive text-white transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out hover:bg-destructive/92",
  icon: "size-8",
} as const

export const editorControl = {
  field: uiControl.field,
  fieldCompact: uiControl.fieldCompact,
  fieldTouch: uiControl.fieldTouch,
  searchField: uiControl.searchField,
} as const

const loaderResourceButtonBase =
  "rounded-[1.6rem] border px-5 sm:px-6 text-left shadow-[0_12px_26px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-200 ease-out hover:-translate-y-px hover:shadow-[0_16px_32px_rgba(15,23,42,0.11)]"

const loaderResourceButtonPrimarySize = "h-[3.35rem] sm:h-[3.55rem]"
const loaderResourceButtonSecondarySize = "h-[3.15rem] sm:h-[3.35rem]"

export const editorLoader = {
  heroPanel:
    "border-0 bg-transparent shadow-none",
  resourceButtonPrimary:
    `${loaderResourceButtonBase} ${loaderResourceButtonPrimarySize} border-sky-300/72 bg-[linear-gradient(180deg,rgba(255,255,255,0.985),rgba(241,247,255,0.95))] text-foreground shadow-[0_14px_28px_rgba(37,99,235,0.08)] hover:border-sky-400/84 hover:bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(236,244,255,0.97))] hover:shadow-[0_18px_34px_rgba(37,99,235,0.11)] dark:border-sky-400/44 dark:bg-[linear-gradient(180deg,rgba(15,33,64,0.9),rgba(12,25,49,0.95))] dark:text-blue-50 dark:hover:border-sky-400/58 dark:hover:bg-[linear-gradient(180deg,rgba(18,38,73,0.94),rgba(14,29,57,0.98))] dark:hover:shadow-[0_18px_38px_rgba(37,99,235,0.26)]`,
  resourceButtonSecondary:
    `${loaderResourceButtonBase} ${loaderResourceButtonSecondarySize} border-amber-300/72 bg-[linear-gradient(180deg,rgba(255,255,255,0.985),rgba(255,246,235,0.95))] text-foreground shadow-[0_14px_28px_rgba(217,119,6,0.08)] hover:border-amber-400/84 hover:bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(255,242,228,0.97))] hover:shadow-[0_18px_34px_rgba(217,119,6,0.11)] dark:border-amber-400/44 dark:bg-[linear-gradient(180deg,rgba(57,41,16,0.88),rgba(43,31,12,0.94))] dark:text-amber-50 dark:hover:border-amber-400/58 dark:hover:bg-[linear-gradient(180deg,rgba(64,46,19,0.92),rgba(49,35,14,0.98))] dark:hover:shadow-[0_16px_34px_rgba(217,119,6,0.22)]`,
  resourceButtonUtility:
    `${loaderResourceButtonBase} ${loaderResourceButtonSecondarySize} border-rose-300/72 bg-[linear-gradient(180deg,rgba(255,255,255,0.985),rgba(253,242,247,0.95))] text-foreground shadow-[0_14px_28px_rgba(190,24,93,0.08)] hover:border-rose-400/84 hover:bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(252,236,244,0.97))] hover:shadow-[0_18px_34px_rgba(190,24,93,0.11)] dark:border-rose-400/44 dark:bg-[linear-gradient(180deg,rgba(74,25,45,0.88),rgba(56,20,34,0.94))] dark:text-rose-50 dark:hover:border-rose-400/58 dark:hover:bg-[linear-gradient(180deg,rgba(83,29,50,0.92),rgba(62,22,38,0.98))] dark:hover:shadow-[0_16px_34px_rgba(190,24,93,0.22)]`,
  actionCard:
    "rounded-[1.6rem] border border-slate-300/66 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(248,250,252,0.78))] shadow-[0_16px_34px_rgba(15,23,42,0.055)] backdrop-blur-lg transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-200 ease-out hover:-translate-y-px hover:border-slate-300/82 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.82))] hover:shadow-[0_20px_40px_rgba(15,23,42,0.085)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(12,15,22,0.95),rgba(10,13,20,0.97))] dark:shadow-[0_20px_42px_rgba(2,6,23,0.22)] dark:hover:border-white/13 dark:hover:bg-[linear-gradient(180deg,rgba(15,18,25,0.97),rgba(12,15,22,0.99))] dark:hover:shadow-[0_22px_46px_rgba(2,6,23,0.28)]",
  cardDivider:
    "h-px w-full bg-gradient-to-r from-transparent via-slate-300/92 to-transparent dark:via-white/10",
  iconBadge:
    "flex items-center justify-center rounded-[0.95rem] border shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_1px_2px_rgba(15,23,42,0.03)] transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-200 ease-out dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
  bodyPanel:
    "rounded-[1.25rem] border border-slate-300/78 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(247,250,253,0.8))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.86),0_12px_22px_rgba(15,23,42,0.03)] backdrop-blur-sm sm:p-5 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(17,20,27,0.94),rgba(13,16,22,0.97))] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
  dropzonePanel:
    "rounded-[1.25rem] border-2 border-dashed border-slate-300/92 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(244,248,252,0.5))] shadow-[inset_0_1px_0_rgba(255,255,255,0.84)] backdrop-blur-sm transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-200 ease-out dark:border-white/12 dark:bg-[linear-gradient(180deg,rgba(9,12,18,0.96),rgba(7,10,16,0.98))] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
  primaryCta:
    "inline-flex h-[2.85rem] sm:h-[2.95rem] items-center justify-center gap-2 rounded-[1.15rem] border border-primary/14 bg-[linear-gradient(180deg,rgba(108,123,182,0.9),rgba(89,104,163,0.94))] px-4 sm:px-[1.15rem] text-[0.95rem] font-medium tracking-[-0.01em] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_18px_rgba(37,99,235,0.08)] transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-200 ease-out hover:-translate-y-px hover:border-primary/20 hover:bg-[linear-gradient(180deg,rgba(113,129,190,0.92),rgba(94,109,170,0.96))] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_22px_rgba(37,99,235,0.1)] dark:border-primary/24 dark:bg-[linear-gradient(180deg,rgba(64,99,191,0.92),rgba(43,79,167,0.95))] dark:hover:border-primary/30 dark:hover:bg-[linear-gradient(180deg,rgba(71,107,202,0.94),rgba(49,86,177,0.97))] dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_24px_rgba(37,99,235,0.16)] disabled:pointer-events-none disabled:opacity-70 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
  subtleMeta:
    "text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.16em] text-foreground/42",
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
