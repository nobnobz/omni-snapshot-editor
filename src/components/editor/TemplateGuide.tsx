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
    Cloud
} from "lucide-react";

export function TemplateGuide() {
    const styles = {
        section_title: "text-[15px] font-bold text-white tracking-tight flex items-center gap-2.5",
        step_badge: "flex-shrink-0 w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[10px] font-black text-blue-400 shadow-sm",
        list_item: "flex items-start gap-3 p-3.5 bg-white/[0.01] border border-white/5 rounded-xl hover:bg-white/[0.03] transition-colors",
        instruction: "text-[13px] text-white/60 leading-relaxed",
        b: "text-white font-semibold"
    };

    return (
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-[#0a0a0a] border-white/5 shadow-2xl">
            {/* Scrollable Container (Header + Content) */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

                {/* Header (Now part of scrolling flow) */}
                <div className="border-b border-white/5 bg-[#0d0d0d] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 blur-[60px] -mr-24 -mt-24 rounded-full" />
                    <div className="relative px-8 py-6 flex items-center gap-5">
                        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div className="space-y-0.5">
                            <DialogHeader className="p-0 text-left space-y-0">
                                <DialogTitle className="text-xl font-black tracking-tight text-white uppercase leading-none">
                                    Installation Guide
                                </DialogTitle>
                                <DialogDescription className="text-[10px] font-bold text-blue-400/50 uppercase tracking-[0.2em] leading-none mt-1.5">
                                    Unified Media Experience
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-10 pt-8">
                    <div className="max-w-2xl mx-auto space-y-12">

                        {/* RECOMMENDED INSTANCES */}
                        <section className="space-y-5">
                            <div className={styles.section_title}>
                                <Settings className="w-4 h-4 text-blue-400" />
                                Recommended Instances
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    {
                                        name: "AIOStreams", icon: Zap, links: [
                                            { text: "Stable Instance", url: "https://aiostreamsfortheweebsstable.midnightignite.me/stremio/configure" },
                                            { text: "Nightly Instance", url: "https://aiostreamsnightlyfortheweak.nhyira.dev/stremio/configure" }
                                        ]
                                    },
                                    {
                                        name: "AIOMetadata", icon: Search, links: [
                                            { text: "Stable Instance", url: "https://aiometadatafortheweebs.midnightignite.me/configure/" },
                                            { text: "Experimental", url: "https://aiometadatafortheweak.nhyira.dev/configure/" }
                                        ]
                                    }
                                ].map((group, i) => (
                                    <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{group.name}</span>
                                            <group.icon className="w-3 h-3 text-blue-400/20" />
                                        </div>
                                        <div className="space-y-2">
                                            {group.links.map((link, j) => (
                                                <a key={j} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-blue-500/10 text-[10px] font-bold text-white/70 hover:text-blue-400 border border-white/5 transition-all">
                                                    {link.text}
                                                    <ChevronRight className="w-3 h-3 text-white/20" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* STEP 1: DOWNLOAD */}
                        <section className="space-y-5">
                            <div className="flex items-center gap-3">
                                <div className={styles.step_badge}>01</div>
                                <h3 className="text-lg font-bold text-white tracking-tight">Download Templates</h3>
                            </div>
                            <div className="ml-10 space-y-4">
                                <p className={styles.instruction}>
                                    Download the JSON files from the <span className="text-blue-400 font-bold italic">UME Templates</span> menu.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {["AIOStreams", "AIOMetadata", "Omni Snapshot"].map((item, i) => (
                                        <Badge key={i} variant="outline" className="bg-white/5 border-white/10 text-white/60 px-2 py-0.5 flex gap-2 items-center text-[9px] font-bold uppercase tracking-tight">
                                            <Download className="w-2.5 h-2.5" /> {item}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* STEP 2: AIOSTREAMS */}
                        <section className="space-y-5">
                            <div className="flex items-center gap-3">
                                <div className={styles.step_badge}>02</div>
                                <h3 className="text-lg font-bold text-white tracking-tight">AIOStreams Setup</h3>
                            </div>
                            <div className="ml-10 space-y-3">
                                {[
                                    { text: "Open AIOStreams and go to **Save & Install**", icon: ExternalLink },
                                    { text: "Select **Import** → **Import Template**", icon: Download },
                                    { text: "Upload the AIOStreams JSON file", icon: CheckCircle2 },
                                    { text: "Add your **API Keys** (Debrid, TMDB, TVDB)", icon: Key },
                                ].map((item, i) => (
                                    <div key={i} className={styles.list_item}>
                                        <item.icon className="w-4 h-4 text-blue-400/50 mt-0.5 shrink-0" />
                                        <span className={styles.instruction} dangerouslySetInnerHTML={{ __html: item.text.replace(/\*\*(.*?)\*\*/g, `<b class="${styles.b}">$1</b>`) }} />
                                    </div>
                                ))}
                                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex gap-4">
                                    <Save className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Crucial</p>
                                        <p className="text-xs text-white/50 leading-relaxed italic">
                                            Set a password, click <span className="text-white font-bold">CREATE</span>, and save your <span className="text-white font-bold">UUID + Password</span>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* STEP 3: AIOMetadata */}
                        <section className="space-y-5">
                            <div className="flex items-center gap-3">
                                <div className={styles.step_badge}>03</div>
                                <h3 className="text-lg font-bold text-white tracking-tight">AIOMetadata Setup</h3>
                            </div>
                            <div className="ml-10 space-y-4">
                                <div className="space-y-3">
                                    {[
                                        { text: "Import the **AIOMetadata Template** in the app", icon: Download },
                                        { text: "Add API keys (Click **MDBList icon** for its key)", icon: Key },
                                        { text: "Set password, save UUID and click **SAVE**", icon: CheckCircle2 },
                                    ].map((item, i) => (
                                        <div key={i} className={styles.list_item}>
                                            <item.icon className="w-4 h-4 text-blue-400/50 mt-0.5 shrink-0" />
                                            <span className={styles.instruction} dangerouslySetInnerHTML={{ __html: item.text.replace(/\*\*(.*?)\*\*/g, `<b class="${styles.b}">$1</b>`) }} />
                                        </div>
                                    ))}
                                </div>
                                {/* Manifest step moved to the end as requested */}
                                <div className="flex items-center gap-3 p-3 bg-blue-950/20 border border-blue-400/10 rounded-xl">
                                    <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                    <p className="text-[10px] text-blue-100/40 font-bold uppercase tracking-tight leading-normal">
                                        Final Step: Add your **AIOStreams Manifest URL** to <span className="text-blue-300">Omni → Addons</span>.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* STEP 4: OMNI */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className={styles.step_badge}>04</div>
                                <h3 className="text-lg font-bold text-white tracking-tight">Omni Snapshot Install</h3>
                            </div>
                            <div className="ml-10 space-y-8">
                                {/* iOS */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                                        <Smartphone className="w-3.5 h-3.5" /> iOS Workflow
                                    </div>
                                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-5">
                                        <div className="flex gap-4">
                                            <div className="text-[9px] font-black text-blue-400/30 w-8">01</div>
                                            <p className="text-xs text-white/60 leading-relaxed font-medium">Move JSON to: <br /> <code className="text-[10px] bg-white/5 px-2 py-1 rounded text-blue-400 mt-2 inline-block font-mono border border-white/5">Files › On my iPhone › Omni › Backups</code></p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="text-[9px] font-black text-blue-400/30 w-8">02</div>
                                            <p className="text-xs text-white font-bold leading-relaxed tracking-tight">
                                                <span className="text-red-500 underline decoration-red-500/20 underline-offset-4 uppercase">Force close Omni completely</span> and restart for the snapshot to appear.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Apple TV */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                                        <Tv className="w-3.5 h-3.5" /> Apple TV Sync
                                    </div>
                                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/10">
                                            <Cloud className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-white uppercase tracking-tight">iCloud Sync</p>
                                            <p className="text-[11px] text-white/40 leading-relaxed font-medium">
                                                Push to <span className="text-blue-400 underline decoration-blue-500/20 underline-offset-4">iCloud</span> on iOS first, then pull on Apple TV.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </DialogContent>
    );
}
