"use client";

import React from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Settings,
    Smartphone,
    Info,
    CheckCircle2,
    Download,
    Save,
    ChevronRight,
    Zap,
    Search,
    Cloud,
    AlertCircle,
    Monitor,
    UploadCloud,
    MousePointer2
} from "lucide-react";
import { useConfig } from "@/context/ConfigContext";
import { cn } from "@/lib/utils";
import { downloadTemplateFile } from "@/lib/template-download";
import { editorLayout } from "@/components/editor/ui/style-contract";

export function TemplateGuide() {
    const { manifest } = useConfig();

    const handleDownload = async (url: string, templateName: string) => {
        try {
            await downloadTemplateFile(url, templateName);
        } catch (err) {
            console.error("Download failed:", err);
        }
    };

    const templates = [
        {
            name: "Omni Snapshot",
            id: "ume-main",
            url: manifest?.templates?.find(t => t.id === 'ume-main')?.url || "https://raw.githubusercontent.com/nobnobz/Omni-Template-Bot-Bid-Raiser/main/fusion-template-bot-bid-raiser-v1.6.2.json"
        },
        {
            name: "AIOMetadata",
            id: "aiometadata",
            url: manifest?.templates?.find(t => t.id === 'aiometadata')?.url || "https://raw.githubusercontent.com/nobnobz/Omni-Template-Bot-Bid-Raiser/main/aiometadata-patterns-v1.json"
        },
        {
            name: "AIOStreams",
            id: "aiostreams",
            url: manifest?.templates?.find(t => t.id === 'aiostreams')?.url || "https://raw.githubusercontent.com/nobnobz/Omni-Template-Bot-Bid-Raiser/main/aiostreams-patterns-v1.json"
        }
    ];
    return (
        <DialogContent className={cn(editorLayout.dialogContent, "sm:max-w-5xl max-h-[95vh] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent")}>
            {/* MATCHING HEADER FROM DOCUMENTATION.tsx */}
            <DialogHeader className="border-b border-border pb-8 mb-8">
                <DialogTitle className="text-3xl font-extrabold flex items-center gap-4 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                    <UploadCloud className="w-10 h-10 text-blue-500" />
                    How to Install - Guide
                </DialogTitle>
                <p className="text-foreground/70 text-sm mt-3 uppercase tracking-[0.2em] font-bold">Unified Media Experience (UME)</p>
            </DialogHeader>

            <div className="space-y-16 pb-12">

                {/* 1. RECOMMENDED INSTANCES - Documentation Card Style */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                        <Settings className="w-7 h-7 text-blue-500" />
                        1. Recommended Instances
                    </h2>
                    <p className="text-sm text-foreground/70 leading-relaxed">
                        This setup works best with these stable and experimental instances:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            {
                                name: "AIOStreams",
                                icon: Zap,
                                links: [
                                    { text: "Stable Instance", url: "https://aiostreamsfortheweebsstable.midnightignite.me/stremio/configure" },
                                    { text: "Nightly Instance", url: "https://aiostreamsnightlyfortheweak.nhyira.dev/stremio/configure" }
                                ]
                            },
                            {
                                name: "AIOMetadata",
                                icon: Search,
                                links: [
                                    { text: "Stable Instance", url: "https://aiometadatafortheweebs.midnightignite.me/configure/" },
                                    { text: "Experimental", url: "https://aiometadatafortheweak.nhyira.dev/configure/" }
                                ]
                            }
                        ].map((group, i) => (
                            <div key={i} className="bg-card/50 p-6 rounded-2xl border border-border hover:border-blue-500/30 transition-colors">
                                <h4 className="font-bold text-blue-400 mb-3 flex items-center gap-2 text-sm uppercase tracking-tight">
                                    <group.icon className="w-4 h-4" />
                                    {group.name}
                                </h4>
                                <div className="space-y-2.5">
                                    {group.links.map((link, j) => (
                                        <a key={j} href={link.url} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center justify-between p-3.5 rounded-xl bg-background/40 hover:bg-blue-500/10 border border-border/50 text-sm font-bold text-foreground/80 hover:text-blue-400 transition-all group">
                                            {link.text}
                                            <ChevronRight className="w-4 h-4 opacity-20 group-hover:opacity-100" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 2. DOWNLOAD TEMPLATES */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                        <Download className="w-7 h-7 text-blue-500" />
                        2. Download Templates
                    </h2>
                    <div className="bg-blue-50 dark:bg-blue-500/5 p-8 rounded-3xl border border-blue-100 dark:border-blue-500/20 space-y-4">
                        <p className="text-sm text-foreground/70 leading-relaxed font-bold">
                            Download the UME Templates:
                        </p>
                        <div className="flex flex-wrap gap-2.5">
                            {templates.map((item, i) => (
                                <Button
                                    key={i}
                                    onClick={() => handleDownload(item.url, manifest?.templates?.find(t => t.id === item.id)?.name || item.name)}
                                    variant="outline"
                                    className="group h-auto min-h-11 items-center gap-2.5 rounded-xl border border-blue-200/80 bg-white/80 px-4 py-2 text-left text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/80 dark:border-blue-500/25 dark:bg-background/35 dark:hover:border-blue-400/45 dark:hover:bg-blue-500/10"
                                >
                                    <div className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-md bg-blue-500/10 ring-1 ring-inset ring-blue-500/25 transition-colors group-hover:bg-blue-500/15">
                                        <FileJson className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                                    </div>
                                    <span className="text-sm font-bold tracking-tight">{item.name}</span>
                                </Button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 3. SETUP PROCESS */}
                <section className="space-y-8">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                        <MousePointer2 className="w-7 h-7 text-blue-500" />
                        3. Configuration Process
                    </h2>

                    <div className="space-y-6">
                        {/* AIOStreams Setup */}
                        <div className="bg-card/40 p-6 rounded-2xl border border-border flex gap-5">
                            <div className="h-12 w-12 shrink-0 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div className="space-y-4 flex-1">
                                <h4 className="font-extrabold text-foreground text-base uppercase tracking-tight">AIOStreams Configuration</h4>
                                <ul className="space-y-2.5 text-sm text-foreground/70 list-disc ml-4">
                                    <li>Open AIOStreams › <strong>Save & Install</strong>.</li>
                                    <li>Select <strong>Import</strong> › <strong>Import Template</strong>.</li>
                                    <li>Upload the AIOStreams template file.</li>
                                    <li>Add your services: <strong>Debrid, TMDB, TVDB API Keys</strong>.</li>
                                </ul>
                                <div className="space-y-4">
                                    <div className="p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 rounded-2xl flex gap-4">
                                        <Save className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                                        <p className="text-sm text-foreground/70 leading-relaxed italic">
                                            Set a password, click <strong className="text-amber-600 dark:text-amber-500">CREATE</strong>, and save your <strong>UUID + Password</strong>.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl flex gap-4">
                                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                        <p className="text-sm text-blue-900 dark:text-foreground/80 font-bold uppercase tracking-tight">
                                            Final Step: Add AIOStreams Manifest URL to <span className="text-blue-600 dark:text-blue-400">Omni › Addons</span>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AIOMetadata Setup */}
                        <div className="bg-card/40 p-6 rounded-2xl border border-border flex gap-5">
                            <div className="h-12 w-12 shrink-0 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400">
                                <Search className="w-6 h-6" />
                            </div>
                            <div className="space-y-4 flex-1">
                                <h4 className="font-extrabold text-foreground text-base uppercase tracking-tight">AIOMetadata Setup</h4>
                                <ul className="space-y-2.5 text-sm text-foreground/70 list-disc ml-4">
                                    <li>Import the <strong>AIOMetadata Template</strong> in the app.</li>
                                    <li>Add your API keys (also your MDBList key in catalogs section).</li>
                                </ul>
                                <div className="space-y-4">
                                    <div className="p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 rounded-2xl flex gap-4">
                                        <Save className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                                        <p className="text-sm text-foreground/70 leading-relaxed italic">
                                            Save configuration, set a password and save your UUID + password.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl flex gap-4">
                                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                        <p className="text-sm text-blue-900 dark:text-foreground/80 font-bold uppercase tracking-tight">
                                            Final Step: Add AIOMetadata Manifest URL to <span className="text-blue-600 dark:text-blue-400">Omni › Addons</span>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. OMNI IMPORT */}
                <section className="space-y-8">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                        <Monitor className="w-7 h-7 text-blue-500" />
                        4. Omni Snapshot Import
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* iOS */}
                        <div className="bg-card/30 p-8 rounded-3xl border border-border flex flex-col gap-6 hover:bg-card/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 shrink-0 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400">
                                    <Smartphone className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-foreground text-lg tracking-tight">iOS Import</h4>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <p className="text-sm text-foreground/70">Move the JSON file to:</p>
                                    <div className="bg-blue-50 dark:bg-background/80 px-4 py-3 rounded-2xl text-blue-600 dark:text-blue-400 font-mono text-sm border border-blue-100 dark:border-border/50 shadow-inner flex items-center gap-3">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                                        Files › On my iPhone › Omni › Backups
                                    </div>
                                </div>

                                <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-4 transition-all">
                                    <AlertCircle className="w-5 h-5 text-amber-500/70 shrink-0 mt-0.5" />
                                    <p className="text-sm leading-relaxed text-foreground/60 italic">
                                        Force close Omni completely and restart for the snapshot to appear.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Apple TV */}
                        <div className="bg-card/30 p-8 rounded-3xl border border-border flex flex-col gap-6 hover:bg-card/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 shrink-0 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400">
                                    <Cloud className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-foreground text-lg tracking-tight">Apple TV Sync</h4>
                            </div>
                            <div className="space-y-4">
                                <p className="text-sm text-foreground/70 leading-relaxed">
                                    Enable <strong className="text-foreground">iCloud Sync</strong> in Omni settings on your iPhone, then pull the setup on your Apple TV.
                                </p>
                                <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center gap-4">
                                    <CheckCircle2 className="w-5 h-5 text-blue-400/70 shrink-0" />
                                    <p className="text-sm text-foreground/60 italic">Automated cloud transfer</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


            </div>
        </DialogContent>

    );
}

// Internal icons not imported from lucide-react in the original list but needed for consistency
function FileJson(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1" />
            <path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1" />
        </svg>
    )
}
