"use client";

import React from "react";
import { Check, Copy, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type LockedUrlInputProps = {
    value?: string;
    onCommit: (nextValue: string | undefined) => void;
    onDraftValueChange?: (nextValue: string) => void;
    placeholder?: string;
    className?: string;
    inputClassName?: string;
    iconButtonClassName?: string;
    copyTitle?: string;
    clearTitle?: string;
    stopPropagation?: boolean;
    disabled?: boolean;
    multiline?: boolean;
    rows?: number;
};

export const LockedUrlInput = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, LockedUrlInputProps>(function LockedUrlInput({
    value,
    onCommit,
    onDraftValueChange,
    placeholder = "https://...",
    className,
    inputClassName,
    iconButtonClassName,
    copyTitle = "Copy URL",
    clearTitle = "Clear URL",
    stopPropagation = false,
    disabled = false,
    multiline = false,
    rows = 2,
}, forwardedRef) {
    const [draftValue, setDraftValue] = React.useState(value ?? "");
    const [copied, setCopied] = React.useState(false);
    const internalRef = React.useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    React.useEffect(() => {
        const nextValue = value ?? "";
        setDraftValue((currentValue) => (currentValue === nextValue ? currentValue : nextValue));
    }, [value]);

    React.useEffect(() => {
        onDraftValueChange?.(draftValue);
    }, [draftValue, onDraftValueChange]);

    React.useEffect(() => {
        if (!copied) return;

        const timeoutId = window.setTimeout(() => setCopied(false), 1200);
        return () => window.clearTimeout(timeoutId);
    }, [copied]);

    const assignInputRef = React.useCallback((node: HTMLInputElement | HTMLTextAreaElement | null) => {
        internalRef.current = node;

        if (typeof forwardedRef === "function") {
            forwardedRef(node);
            return;
        }

        if (forwardedRef) {
            (forwardedRef as React.MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>).current = node;
        }
    }, [forwardedRef]);

    const committedValue = value ?? "";
    const hasCommittedValue = committedValue.trim().length > 0;
    const isLocked = hasCommittedValue && !disabled;
    const hasAnyValue = committedValue.trim().length > 0 || draftValue.trim().length > 0;

    const stopInputPropagation = <T extends { stopPropagation: () => void }>(event: T) => {
        if (stopPropagation) {
            event.stopPropagation();
        }
    };

    const commitValue = (nextValue: string) => {
        if (disabled) return;

        const normalizedNextValue = nextValue.trim();
        const normalizedCurrentValue = committedValue.trim();
        if (normalizedNextValue === normalizedCurrentValue) return;

        onCommit(normalizedNextValue === "" ? undefined : normalizedNextValue);
    };

    const handleBlur = () => {
        if (isLocked) return;
        commitValue(draftValue);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        stopInputPropagation(event);
        if (isLocked) return;

        if (event.key === "Enter") {
            event.preventDefault();
            commitValue(draftValue);
            event.currentTarget.blur();
            return;
        }

        if (event.key === "Escape") {
            const nextValue = value ?? "";
            setDraftValue(nextValue);
            event.currentTarget.blur();
        }
    };

    const copyCommittedValue = React.useCallback(async () => {
        if (!hasCommittedValue || typeof navigator === "undefined" || !navigator.clipboard) return;

        try {
            await navigator.clipboard.writeText(committedValue.trim());
            setCopied(true);
        } catch {
            setCopied(false);
        }
    }, [committedValue, hasCommittedValue]);

    const handleCopyClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        stopInputPropagation(event);
        void copyCommittedValue();
    };

    const handleLockedDisplayClick = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        stopInputPropagation(event);
        void copyCommittedValue();
    };

    const handleEditableFieldPointerDown = (event: React.PointerEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        stopInputPropagation(event);
    };

    const handleEditableFieldMouseDown = (event: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        stopInputPropagation(event);
    };

    const handleEditableFieldClick = (event: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        stopInputPropagation(event);
    };

    const handleClearClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        stopInputPropagation(event);
        if (!hasAnyValue || disabled) return;

        setDraftValue("");
        setCopied(false);
        commitValue("");

        requestAnimationFrame(() => {
            internalRef.current?.focus({ preventScroll: true });
        });
    };

    return (
        <div className={cn("relative w-full", className)}>
            {isLocked ? (
                <div
                    onPointerDown={(event) => {
                        stopInputPropagation(event);
                        event.preventDefault();
                    }}
                    onMouseDown={(event) => {
                        stopInputPropagation(event);
                        event.preventDefault();
                    }}
                    onClick={handleLockedDisplayClick}
                    className={cn(
                        "w-full min-w-0 overflow-hidden rounded-md border text-left select-none transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out",
                        "!pr-[116px] font-mono border-slate-200/95 bg-slate-100/90 text-foreground/58 shadow-none dark:border-white/10 dark:bg-white/[0.05] dark:text-foreground/58 sm:!pr-[104px]",
                        multiline
                            ? "whitespace-pre-wrap break-all px-3 py-3 leading-[1.35]"
                            : "flex items-center px-3",
                        inputClassName
                    )}
                >
                    {multiline ? committedValue : (
                        <span className="block min-w-0 flex-1 truncate">
                            {committedValue}
                        </span>
                    )}
                </div>
            ) : multiline ? (
                <Textarea
                    ref={assignInputRef}
                    value={draftValue}
                    readOnly={isLocked}
                    disabled={disabled}
                    rows={rows}
                    placeholder={placeholder}
                    onChange={(event) => setDraftValue(event.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    onPointerDown={handleEditableFieldPointerDown}
                    onMouseDown={handleEditableFieldMouseDown}
                    onClick={handleEditableFieldClick}
                    className={cn(
                        "w-full !pr-[116px] [field-sizing:fixed] font-mono leading-[1.35] read-only:cursor-default read-only:border-slate-200/95 read-only:bg-slate-100/90 read-only:text-foreground/58 read-only:shadow-none read-only:hover:border-slate-200/95 read-only:hover:bg-slate-100/90 read-only:focus-visible:border-slate-200/95 read-only:focus-visible:ring-0 read-only:selection:bg-primary/15 dark:read-only:border-white/10 dark:read-only:bg-white/[0.05] dark:read-only:text-foreground/58 dark:read-only:hover:border-white/10 dark:read-only:hover:bg-white/[0.05] sm:!pr-[104px]",
                        inputClassName
                    )}
                />
            ) : (
                <Input
                    ref={assignInputRef}
                    type="text"
                    value={draftValue}
                    readOnly={isLocked}
                    disabled={disabled}
                    placeholder={placeholder}
                    onChange={(event) => setDraftValue(event.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    onPointerDown={handleEditableFieldPointerDown}
                    onMouseDown={handleEditableFieldMouseDown}
                    onClick={handleEditableFieldClick}
                    className={cn(
                        "w-full !pr-[116px] font-mono read-only:cursor-default read-only:border-slate-200/95 read-only:bg-slate-100/90 read-only:text-foreground/58 read-only:shadow-none read-only:hover:border-slate-200/95 read-only:hover:bg-slate-100/90 read-only:focus-visible:border-slate-200/95 read-only:focus-visible:ring-0 read-only:selection:bg-primary/15 dark:read-only:border-white/10 dark:read-only:bg-white/[0.05] dark:read-only:text-foreground/58 dark:read-only:hover:border-white/10 dark:read-only:hover:bg-white/[0.05] sm:!pr-[104px]",
                        inputClassName
                    )}
                />
            )}
            {copied && (
                <div className="pointer-events-none absolute right-0 top-0 hidden -translate-y-[calc(100%+0.4rem)] sm:block">
                    <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/96 px-2.5 py-1 text-[11px] font-semibold text-foreground/76 shadow-sm">
                        <Check className="h-3.5 w-3.5" />
                        <span>Copied</span>
                    </div>
                </div>
            )}
            {hasAnyValue && (
                <div className="pointer-events-none absolute right-[1px] top-[1px] bottom-[1px] flex items-center gap-1 border-l border-slate-200/60 bg-white pl-1.5 pr-1 dark:border-white/10 dark:bg-[#0c0f16] rounded-r-[inherit]">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={handleCopyClick}
                        disabled={!hasCommittedValue}
                        className={cn(
                            "pointer-events-auto h-8 w-8 shrink-0 rounded-md text-foreground/65 hover:bg-muted/80 hover:text-foreground active:scale-[0.92] dark:text-foreground/56 dark:hover:bg-muted/40",
                            iconButtonClassName
                        )}
                        title={copyTitle}
                        aria-label={copyTitle}
                    >
                        {copied ? <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={handleClearClick}
                        disabled={!hasAnyValue || disabled}
                        className={cn(
                            "pointer-events-auto h-8 w-8 shrink-0 rounded-md text-foreground/65 hover:bg-rose-500/10 hover:text-rose-600 active:scale-[0.92] dark:text-foreground/56 dark:hover:bg-rose-500/15 dark:hover:text-rose-400",
                            iconButtonClassName
                        )}
                        title={clearTitle}
                        aria-label={clearTitle}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
});
