import React from "react";
import { Info, Check, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditorTone } from "@/components/editor/ui/style-contract";

export interface EditorNoticeProps extends React.HTMLAttributes<HTMLDivElement> {
    /** The semantic tone of the notice box */
    tone: EditorTone;
    /** Optional custom icon to replace the default one */
    icon?: React.ReactNode;
    /** If true, aligns items to the center vertically. Defaults to top (start). */
    alignCenter?: boolean;
}

const toneStyles: Record<EditorTone, { wrapper: string; iconWrapper: string; text: string }> = {
    neutral: {
        wrapper: "border-slate-500/20 bg-slate-500/[0.08] shadow-[0_6px_14px_rgba(100,116,139,0.06)]",
        iconWrapper: "border-slate-500/18 bg-slate-500/10 text-slate-600 dark:text-slate-400",
        text: "text-slate-800 dark:text-slate-200",
    },
    info: {
        wrapper: "border-sky-500/20 bg-sky-500/[0.08] shadow-[0_6px_14px_rgba(14,165,233,0.06)]",
        iconWrapper: "border-sky-500/18 bg-sky-500/10 text-sky-600 dark:text-sky-400",
        text: "text-sky-800 dark:text-sky-200",
    },
    success: {
        wrapper: "border-emerald-500/20 bg-emerald-500/[0.08] shadow-[0_6px_14px_rgba(16,185,129,0.06)]",
        iconWrapper: "border-emerald-500/18 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        text: "text-emerald-800 dark:text-emerald-200",
    },
    warning: {
        wrapper: "border-amber-500/20 bg-amber-500/[0.08] shadow-[0_6px_14px_rgba(245,158,11,0.06)]",
        iconWrapper: "border-amber-500/18 bg-amber-500/10 text-amber-600 dark:text-amber-400",
        text: "text-amber-800 dark:text-amber-200",
    },
    danger: {
        wrapper: "border-rose-500/20 bg-rose-500/[0.08] shadow-[0_6px_14px_rgba(225,29,72,0.06)]",
        iconWrapper: "border-rose-500/18 bg-rose-500/10 text-rose-600 dark:text-rose-400",
        text: "text-rose-800 dark:text-rose-200",
    },
};

const defaultIcons: Record<EditorTone, React.ReactNode> = {
    neutral: <Info className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
    success: <Check className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    danger: <AlertCircle className="h-4 w-4" />,
};

export const EditorNotice = React.forwardRef<HTMLDivElement, EditorNoticeProps>(
    ({ className, tone, icon, alignCenter = false, children, ...props }, ref) => {
        const { wrapper, iconWrapper, text } = toneStyles[tone];

        return (
            <div
                ref={ref}
                className={cn("rounded-xl border px-3.5 py-3 text-sm transition-all duration-200", wrapper, className)}
                {...props}
            >
                <div className={cn("flex gap-2.5", alignCenter ? "items-center" : "items-start")}>
                    <div className={cn("rounded-lg border p-1.5 shrink-0", iconWrapper)}>
                        {icon || defaultIcons[tone]}
                    </div>
                    <div className={cn("min-w-0 flex-1 font-medium", text)}>
                        {children}
                    </div>
                </div>
            </div>
        );
    }
);
EditorNotice.displayName = "EditorNotice";
