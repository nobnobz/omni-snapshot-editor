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
    AlertCircle
} from "lucide-react";

export function TemplateGuide() {
    // --- UNIFIED DESIGN SYSTEM ---
    // Strict typography and component tokens for absolute consistency
    const UI = {
        font: {
            title: "text-[18px] font-black tracking-tight text-white uppercase",
            subtitle: "text-[11px] font-bold text-blue-400/50 uppercase tracking-[0.2em]",
            section_h: "text-[15px] font-black text-white tracking-tight uppercase mb-4 flex items-center gap-2",
            step_h: "text-[16px] font-black text-white tracking-tight leading-tight",
            body: "text-[13px] text-white/50 leading-relaxed",
            label: "text-[10px] font-black text-white/30 uppercase tracking-[0.1em]",
            code: "text-[11px] font-mono font-medium text-blue-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5",
            bold: "text-white font-bold",
            italic: "text-white/40 italic font-medium"
        },
        box: {
            main: "bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6",
            inner: "bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 transition-all duration-200",
            step_icon: "w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[11px] font-black text-blue-400 shadow-sm shrink-0",
            action: "flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-blue-500/10 hover:border-blue-500/20 transition-all group cursor-pointer"
        }
    };

    return (
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-[#0a0a0a] border-white/5 shadow-2xl">
            {/* Scrollable Flow */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

                {/* 1. Header (Part of scrolling flow to maximize space) */}
                <div className="border-b border-white/5 bg-[#0d0d0d] relative overflow-hidden px-10 py-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] -mr-32 -mt-32 rounded-full" />
                    <div className="relative flex items-center gap-6">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <DialogHeader className="p-0 text-left space-y-0">
                                <DialogTitle className={UI.font.title}>Installation Guide</DialogTitle>
                                <DialogDescription className={UI.font.subtitle}>Unified Media Experience</DialogDescription>
                            </DialogHeader>
                        </div>
                    </div>
                </div>

                {/* 2. Main Sections */}
                <div className="px-10 py-12 space-y-16">

                    {/* RECOMMENDED INSTANCES */}
                    <section>
                        <h2 className={UI.font.section_h}>
                            <Settings className="w-4 h-4 text-blue-400" />
                            Recommended Instances
                        </h2>
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
                                <div key={i} className={UI.box.main}>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={UI.font.label}>{group.name}</span>
                                        <group.icon className="w-3.5 h-3.5 text-blue-400/20" />
                                    </div>
                                    <div className="space-y-2">
                                        {group.links.map((link, j) => (
                                            <a key={j} href={link.url} target="_blank" rel="noopener noreferrer" className={UI.box.action}>
                                                <span className="text-[12px] font-bold text-white/70 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{link.text}</span>
                                                <ChevronRight className="w-3.5 h-3.5 text-white/10 group-hover:text-blue-400 transition-colors" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* STEP 1: DOWNLOAD */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className={UI.box.step_icon}>01</div>
                            <h3 className={UI.font.step_h}>Download Templates</h3>
                        </div>
                        <div className="ml-12 space-y-5">
                            <p className={UI.font.body}>
                                Access the <span className={UI.font.bold}>UME Templates</span> menu and download the following core files:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {["AIOStreams", "AIOMetadata", "Omni Snapshot"].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] font-black text-white/60 uppercase tracking-tight">
                                        <Download className="w-3 h-3 text-blue-400/30" /> {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* STEP 2: AIOSTREAMS */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className={UI.box.step_icon}>02</div>
                            <h3 className={UI.font.step_h}>AIOStreams Configuration</h3>
                        </div>
                        <div className="ml-12 space-y-3">
                            {[
                                "Open AIOStreams › **Save & Install**",
                                "Select **Import** › **Import Template**",
                                "Upload the AIOStreams template file",
                                "Add your **API Keys** (Debrid, TMDB, TVDB)",
                            ].map((text, i) => (
                                <div key={i} className={UI.box.inner + " flex items-center gap-4"}>
                                    <CheckCircle2 className="w-4 h-4 text-blue-500/20 shrink-0" />
                                    <span className={UI.font.body} dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, `<b class="${UI.font.bold}">$1</b>`) }} />
                                </div>
                            ))}
                            <div className="p-5 bg-blue-500/[0.02] border border-blue-500/20 rounded-2xl flex gap-5 mt-4 group">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/10 transition-transform group-hover:scale-110">
                                    <Save className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Critical Step</p>
                                    <p className={UI.font.body + " italic"}>
                                        Set a password, click <span className={UI.font.bold}>CREATE</span>, and securely save your <span className={UI.font.bold}>UUID + Password</span>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* STEP 3: AIOMetadata */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className={UI.box.step_icon}>03</div>
                            <h3 className={UI.font.step_h}>AIOMetadata Setup</h3>
                        </div>
                        <div className="ml-12 space-y-3">
                            {[
                                "Import the **AIOMetadata Template** in-app",
                                "Add API keys (Click **MDBList** icon for its key)",
                                "Set password, save the UUID and click **SAVE**",
                            ].map((text, i) => (
                                <div key={i} className={UI.box.inner + " flex items-center gap-4"}>
                                    <CheckCircle2 className="w-4 h-4 text-blue-500/20 shrink-0" />
                                    <span className={UI.font.body} dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, `<b class="${UI.font.bold}">$1</b>`) }} />
                                </div>
                            ))}
                            <div className="p-5 bg-white/[0.02] border border-white/[0.08] rounded-2xl flex items-center gap-5 mt-4">
                                <Info className="w-5 h-5 text-blue-400/50 shrink-0" />
                                <div className="space-y-0.5">
                                    <p className="text-[11px] text-white/70 font-black uppercase tracking-tight">Final Step</p>
                                    <p className={UI.font.body}>
                                        Connect everything in <span className={UI.font.bold}>Omni → Addons</span> with your manifest URL.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* STEP 4: OMNI */}
                    <section className="space-y-10">
                        <div className="flex items-center gap-4">
                            <div className={UI.box.step_icon}>04</div>
                            <h3 className={UI.font.step_h}>Omni Snapshot Import</h3>
                        </div>
                        <div className="ml-12 space-y-12">
                            {/* iOS Workflow */}
                            <div className="space-y-4">
                                <span className={UI.font.label + " flex items-center gap-2"}><Smartphone className="w-4 h-4" /> iOS Device Workflow</span>
                                <div className={UI.box.main + " space-y-6"}>
                                    <div className="flex gap-5">
                                        <span className="text-[10px] font-black text-blue-500/30 w-4">01</span>
                                        <div className="space-y-2">
                                            <p className={UI.font.body}>Move the JSON file to:</p>
                                            <code className={UI.font.code}>Files › On my iPhone › Omni › Backups</code>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-xl flex items-start gap-4">
                                        <AlertCircle className="w-5 h-5 text-blue-400/40 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className={UI.font.bold + " text-[13px]"}>Force close Omni and restart</p>
                                            <p className={UI.font.body + " text-[12px]"}>This ensures the app refreshes and detects the new file.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-5">
                                        <span className="text-[10px] font-black text-blue-500/30 w-4">02</span>
                                        <p className={UI.font.italic + " text-[12px]"}>Folder missing? Create a manual Snapshot in the app first.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Apple TV Sync */}
                            <div className="space-y-4">
                                <span className={UI.font.label + " flex items-center gap-2"}><Tv className="w-4 h-4" /> Apple TV Synchronization</span>
                                <div className={UI.box.main + " flex items-center gap-6"}>
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/5 flex items-center justify-center shrink-0 border border-blue-500/10">
                                        <Cloud className="w-7 h-7 text-blue-400/40" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className={UI.font.bold + " text-[13px] uppercase tracking-tight"}>iCloud Sync</p>
                                        <p className={UI.font.body}>
                                            Push to <span className={UI.font.bold}>iCloud</span> on your phone settings, then pull on Apple TV.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer Spacer */}
                <div className="h-12" />
            </div>
        </DialogContent>
    );
}
