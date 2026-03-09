"use client";

import React from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    ExternalLink,
    Settings,
    Smartphone,
    Tv,
    Info,
    CheckCircle2,
    BookOpen,
    Download,
    Key,
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

export function TemplateGuide() {
    return (
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-background border-border text-foreground scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
            {/* MATCHING HEADER FROM DOCUMENTATION.tsx */}
            <DialogHeader className="border-b border-border pb-6 mb-6">
                <DialogTitle className="text-3xl font-extrabold flex items-center gap-3 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                    <UploadCloud className="w-8 h-8 text-blue-500" />
                    How to Install - Guide
                </DialogTitle>
                <p className="text-foreground/70 text-sm mt-2 uppercase tracking-[0.2em] font-bold">Unified Media Experience</p>
            </DialogHeader>

            <div className="space-y-12 pb-10">

                {/* 1. RECOMMENDED INSTANCES - Documentation Card Style */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Settings className="w-6 h-6 text-blue-500" />
                        1. Recommended Instances
                    </h2>
                    <p className="text-sm text-foreground/70 leading-relaxed">
                        This setup works best with these stable and experimental instances:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <div key={i} className="bg-card/50 p-5 rounded-xl border border-border hover:border-blue-500/30 transition-colors">
                                <h4 className="font-bold text-blue-400 mb-3 flex items-center gap-2 text-sm uppercase tracking-tight">
                                    <group.icon className="w-4 h-4" />
                                    {group.name}
                                </h4>
                                <div className="space-y-2">
                                    {group.links.map((link, j) => (
                                        <a key={j} href={link.url} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center justify-between p-3 rounded-lg bg-background/40 hover:bg-blue-500/10 border border-border/50 text-[11px] font-bold text-foreground/80 hover:text-blue-400 transition-all group">
                                            {link.text}
                                            <ChevronRight className="w-3.5 h-3.5 opacity-20 group-hover:opacity-100" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 2. DOWNLOAD TEMPLATES */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Download className="w-6 h-6 text-blue-500" />
                        2. Download Templates
                    </h2>
                    <div className="bg-blue-500/5 p-6 rounded-2xl border border-blue-500/20 space-y-4">
                        <p className="text-sm text-foreground/70 leading-relaxed">
                            Access the <strong>UME Templates</strong> menu in the navigation bar and download these core files:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {["AIOStreams", "AIOMetadata", "Omni Snapshot"].map((item, i) => (
                                <div key={i} className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-background border border-border text-[10px] font-black text-foreground/60 uppercase tracking-tight">
                                    <FileJson className="w-3 h-3 text-blue-400" /> {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 3. SETUP PROCESS */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <MousePointer2 className="w-6 h-6 text-blue-500" />
                        3. Configuration Process
                    </h2>

                    <div className="space-y-4">
                        {/* AIOStreams Setup */}
                        <div className="bg-card/40 p-5 rounded-2xl border border-border flex gap-4">
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div className="space-y-3 flex-1">
                                <h4 className="font-extrabold text-foreground text-sm uppercase tracking-tight">AIOStreams Configuration</h4>
                                <ul className="space-y-2 text-[11px] text-foreground/70 list-disc ml-4">
                                    <li>Open AIOStreams › <strong>Save & Install</strong>.</li>
                                    <li>Select <strong>Import</strong> › <strong>Import Template</strong>.</li>
                                    <li>Upload the AIOStreams template file.</li>
                                    <li>Add your services: <strong>Debrid, TMDB, TVDB API Keys</strong>.</li>
                                </ul>
                                <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-3 mt-2">
                                    <Save className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-foreground/70 leading-relaxed italic">
                                        Set a password, click <strong className="text-amber-500">CREATE</strong>, and save your <strong>UUID + Password</strong>.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* AIOMetadata Setup */}
                        <div className="bg-card/40 p-5 rounded-2xl border border-border flex gap-4">
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
                                <Search className="w-5 h-5" />
                            </div>
                            <div className="space-y-3 flex-1">
                                <h4 className="font-extrabold text-foreground text-sm uppercase tracking-tight">AIOMetadata Setup</h4>
                                <ul className="space-y-2 text-[11px] text-foreground/70 list-disc ml-4">
                                    <li>Import the <strong>AIOMetadata Template</strong> in the app.</li>
                                    <li>Add API keys (Click <strong>MDBList icon</strong> for your personal key).</li>
                                    <li>Set password, save the UUID and click <strong>SAVE</strong>.</li>
                                </ul>
                                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3">
                                    <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-foreground/80 font-bold uppercase tracking-tight">
                                        Final Step: Add AIOStreams Manifest URL to <span className="text-blue-400">Omni › Addons</span>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. OMNI IMPORT */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Monitor className="w-6 h-6 text-blue-500" />
                        4. Omni Snapshot Import
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* iOS */}
                        <div className="bg-card/40 p-5 rounded-2xl border border-border flex gap-4">
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <div className="space-y-3">
                                <h4 className="font-bold text-foreground text-sm">iOS Import</h4>
                                <div className="space-y-3 text-[11px] text-foreground/70">
                                    <p>Move the JSON file to:</p>
                                    <div className="bg-muted px-2 py-1.5 rounded-lg text-blue-400 font-mono text-[10px]">
                                        Files › On my iPhone › Omni › Backups
                                    </div>
                                    <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                                        <p className="text-[10px] italic">Force close Omni completely and restart for the snapshot to appear.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Apple TV */}
                        <div className="bg-card/40 p-5 rounded-2xl border border-border flex gap-4">
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
                                <Cloud className="w-5 h-5" />
                            </div>
                            <div className="space-y-3">
                                <h4 className="font-bold text-foreground text-sm">Apple TV Sync</h4>
                                <p className="text-[11px] text-foreground/70 leading-relaxed">
                                    The easiest way: Enable <strong>iCloud Sync</strong> in Omni settings on your iPhone, then pull the setup on your Apple TV.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FOOTER - Matching Documentation.tsx */}
                <footer className="text-center pt-8 border-t border-border">
                    <p className="text-[10px] text-foreground/70 font-bold uppercase tracking-widest bg-card inline-block px-4 py-1 rounded-full border border-border">
                        Omni Snapshot Manager v0.2.0 • Unified Media Experience
                    </p>
                </footer>
            </div>
        </DialogContent>
    );
}

// Internal icons not imported from lucide-react in the original list but needed for consistency
function FileJson(props: any) {
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
