"use client";

import React from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
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
    const styles = {
        section_title: "text-[16px] font-black text-white tracking-tight flex items-center gap-3",
        step_badge: "flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[11px] font-black text-blue-400 shadow-sm",
        list_item: "flex items-start gap-4 p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.04] transition-all duration-200",
        instruction: "text-[13.5px] text-white/60 leading-relaxed",
        b: "text-white font-bold",
        accent_box: "p-4 rounded-2xl border border-white/5 bg-white/[0.01]",
        info_pill: "px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400/80 text-[9px] font-black uppercase tracking-widest border border-blue-500/10"
    };

    return (
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-[#080808] border-white/5 shadow-2xl">
            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

                {/* Header Section */}
                <div className="border-b border-white/5 bg-[#0a0a0a] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] -mr-32 -mt-32 rounded-full" />
                    <div className="relative px-10 py-7 flex items-center gap-6">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div className="space-y-1">
                            <DialogHeader className="p-0 text-left space-y-0 text-white">
                                <DialogTitle className="text-2xl font-black tracking-tight uppercase leading-none">
                                    Installation Guide
                                </DialogTitle>
                                <DialogDescription className="text-xs font-bold text-blue-400/40 uppercase tracking-[0.25em] leading-none mt-2">
                                    Unified Media Experience
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="px-10 py-10 space-y-16">

                    {/* RECOMMENDED INSTANCES - REDESIGNED */}
                    <section className="space-y-6">
                        <div className={styles.section_title}>
                            <Settings className="w-5 h-5 text-blue-400" />
                            Recommended Instances
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {[
                                {
                                    name: "AIOStreams",
                                    icon: Zap,
                                    color: "blue",
                                    links: [
                                        { text: "Stable Instance", url: "https://aiostreamsfortheweebsstable.midnightignite.me/stremio/configure" },
                                        { text: "Nightly Instance", url: "https://aiostreamsnightlyfortheweak.nhyira.dev/stremio/configure" }
                                    ]
                                },
                                {
                                    name: "AIOMetadata",
                                    icon: Search,
                                    color: "blue",
                                    links: [
                                        { text: "Stable Instance", url: "https://aiometadatafortheweebs.midnightignite.me/configure/" },
                                        { text: "Experimental", url: "https://aiometadatafortheweak.nhyira.dev/configure/" }
                                    ]
                                }
                            ].map((group, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <group.icon className="w-3.5 h-3.5 text-blue-400" />
                                        <span className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em]">{group.name}</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {group.links.map((link, j) => (
                                            <a key={j} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-blue-500/10 hover:border-blue-500/20 transition-all group">
                                                <span className="text-xs font-bold text-white/70 group-hover:text-white transition-colors">{link.text}</span>
                                                <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-blue-400 transition-colors" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* STEP 1: DOWNLOAD */}
                    <section className="space-y-5">
                        <div className="flex items-center gap-4">
                            <div className={styles.step_badge}>01</div>
                            <h3 className="text-lg font-black text-white tracking-tight">Download Templates</h3>
                        </div>
                        <div className="ml-12 space-y-4">
                            <p className={styles.instruction}>
                                You will need the JSON files from the <span className="text-blue-400 font-bold decoration-blue-500/20 underline underline-offset-4">UME Templates</span> menu:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {["AIOStreams", "AIOMetadata", "Omni Snapshot"].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-white/60 uppercase tracking-tight">
                                        <Download className="w-3 h-3 text-blue-400/50" /> {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* STEP 2: AIOSTREAMS */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className={styles.step_badge}>02</div>
                            <h3 className="text-lg font-black text-white tracking-tight">AIOStreams Configuration</h3>
                        </div>
                        <div className="ml-12 space-y-3">
                            {[
                                { text: "Open AIOStreams and navigate to **Save & Install**", icon: ExternalLink },
                                { text: "Click **Import** → **Import Template**", icon: Download },
                                { text: "Select and upload the AIOStreams template file", icon: CheckCircle2 },
                                { text: "Add your services: **Debrid, TMDB, TVDB API Keys**", icon: Key },
                            ].map((item, i) => (
                                <div key={i} className={styles.list_item}>
                                    <item.icon className="w-4 h-4 text-blue-400/50 mt-0.5 shrink-0" />
                                    <span className={styles.instruction} dangerouslySetInnerHTML={{ __html: item.text.replace(/\*\*(.*?)\*\*/g, `<b class="${styles.b}">$1</b>`) }} />
                                </div>
                            ))}
                            <div className="p-5 bg-blue-500/[0.04] border border-blue-500/20 rounded-2xl flex gap-5">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/10">
                                    <Save className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="space-y-1">
                                    <span className={styles.info_pill}>Crucial</span>
                                    <p className="text-xs text-white/50 leading-relaxed italic mt-2 font-medium">
                                        Set a secure password, click <span className="text-white font-bold">CREATE</span>, and store your <span className="text-white font-bold underline decoration-blue-500/40">UUID + Password</span>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* STEP 3: AIOMetadata */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className={styles.step_badge}>03</div>
                            <h3 className="text-lg font-black text-white tracking-tight">AIOMetadata Setup</h3>
                        </div>
                        <div className="ml-12 space-y-4">
                            <div className="space-y-3">
                                {[
                                    { text: "Import the **AIOMetadata Template** in the app", icon: Download },
                                    { text: "Enter API keys (Click **MDBList icon** for its key)", icon: Key },
                                    { text: "Set password, save the UUID and click **SAVE**", icon: CheckCircle2 },
                                ].map((item, i) => (
                                    <div key={i} className={styles.list_item}>
                                        <item.icon className="w-4 h-4 text-blue-400/50 mt-0.5 shrink-0" />
                                        <span className={styles.instruction} dangerouslySetInnerHTML={{ __html: item.text.replace(/\*\*(.*?)\*\*/g, `<b class="${styles.b}">$1</b>`) }} />
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-blue-900/10 border border-blue-500/20 rounded-2xl">
                                <Info className="w-5 h-5 text-blue-400 shrink-0" />
                                <div className="space-y-1">
                                    <span className={styles.info_pill}>Final Step</span>
                                    <p className="text-xs text-white/70 leading-relaxed font-bold mt-1 uppercase tracking-tight">
                                        Add AIOStreams Manifest URL to <span className="text-blue-400">Omni → Addons</span>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* STEP 4: OMNI */}
                    <section className="space-y-10">
                        <div className="flex items-center gap-4">
                            <div className={styles.step_badge}>04</div>
                            <h3 className="text-lg font-black text-white tracking-tight">Omni Snapshot Import</h3>
                        </div>
                        <div className="ml-12 space-y-10">
                            {/* iOS */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Smartphone className="w-4 h-4 text-white/20" />
                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">iOS Workflow</span>
                                </div>
                                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 space-y-6">
                                    <div className="flex gap-5">
                                        <div className="text-[10px] font-black text-blue-500/40 w-6">01</div>
                                        <p className="text-xs text-white/70 leading-relaxed">
                                            Move the template to: <br />
                                            <code className="text-[11px] bg-white/5 px-2 py-1 rounded-md text-blue-400 mt-2 inline-block font-mono border border-white/5 tracking-tighter">Files › On my iPhone › Omni › Backups</code>
                                        </p>
                                    </div>

                                    {/* REDESIGNED ALERT (Toned down) */}
                                    <div className="flex gap-5 p-4 bg-white/[0.03] border border-white/10 rounded-xl relative group">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/30 rounded-l-xl group-hover:bg-blue-500 transition-colors" />
                                        <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-xs text-white/80 font-bold leading-relaxed">
                                                Force close Omni completely and restart the app for the snapshot to appear in the list.
                                            </p>
                                            <p className="text-[10px] text-white/40 font-medium">This is required for the app to refresh internal cache.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-5">
                                        <div className="text-[10px] font-black text-blue-500/40 w-6">02</div>
                                        <p className="text-[11px] text-white/40 italic font-medium">Folder missing? Create any manual Snapshot in the app first.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Apple TV */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Tv className="w-4 h-4 text-white/20" />
                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Apple TV Sync</span>
                                </div>
                                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 flex items-start gap-5 hover:bg-white/[0.03] transition-all">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/10">
                                        <Cloud className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-xs font-bold text-white uppercase tracking-tight">iCloud Cloud Sync</p>
                                        <p className="text-[11px] text-white/50 leading-relaxed font-medium">
                                            The easiest way: Push to <span className="text-blue-400 font-bold decoration-blue-500/30 underline underline-offset-4">iCloud</span> in Omni settings on your phone, then pull it it on Apple TV.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Subtle Footer Spacer */}
                <div className="h-6" />
            </div>
        </DialogContent>
    );
}
