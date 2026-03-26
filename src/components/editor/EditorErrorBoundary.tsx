"use client";

import React from "react";
import { Button } from "@/components/ui/button";

type EditorErrorBoundaryState = {
    hasError: boolean;
};

export class EditorErrorBoundary extends React.Component<React.PropsWithChildren, EditorErrorBoundaryState> {
    constructor(props: React.PropsWithChildren) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error) {
        console.error("Editor boundary caught an error:", error);
    }

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        return (
            <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6">
                    <h2 className="text-xl font-bold text-foreground">The editor hit an unexpected error.</h2>
                    <p className="mt-2 text-sm text-foreground/70">
                        Your current page can be reloaded without leaving the app shell.
                    </p>
                    <div className="mt-4 flex justify-center">
                        <Button onClick={() => window.location.reload()} className="font-semibold">
                            Reload editor
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}
