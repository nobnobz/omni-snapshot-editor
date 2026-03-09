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
    Layers,
    Database,
    Cloud,
    Zap,
    ChevronRight,
    Search,
    BookOpen,
    Download,
    Key,
    Save
} from "lucide-react";

export function TemplateGuide() {
    // Shared Design Tokens for absolute consistency
    const COLORS = {
        primary: "text-blue-400",
        secondary: "text-blue-200/50",
        border: "border-white/10",
        bg_card: "bg-white/[0.03]",
        accent: "bg-blue-500/10"
    };

    const styles = {
        section_title: "text-lg font-bold text-white tracking-tight flex items-center gap-3",
        step_badge: "flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[11px] font-black text-blue-400 shadow-sm",
        card: "bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden",
        list_item: "flex items-start gap-3 p-4 bg-white/[0.01] border border-white/5 rounded-xl hover:bg-white/[0.03] transition-colors",
        instruction: "text-[13px] text-white/60 leading-relaxed",
        b: "text-white font-semibold"
    };

    return (
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-[#0a0a0a] border-white/5 shadow-2xl">
            {/* Header: Simplified & Robust */}
            <DialogHeader className="relative p-8 pb-8 border-b border-white/5 bg-[#0d0d0d] space-y-0 text-left">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[90px] -mr-32 -mt-32 rounded-full" />

                <div className="relative flex items-center gap-6">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <BookOpen className="w-7 h-7 text-white" />
                    </div>
                    <div className="space-y-1">
                        <DialogTitle className="text-2xl font-black tracking-tighter text-white uppercase italic">
                            Installation Guide
                        </DialogTitle>
                        <DialogDescription className="text-xs font-bold text-blue-400/50 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span>Unified Media Experience</span>
                            <span className="w-1 h-1 rounded-full bg-blue-400/20" />
                            <span>v0.2.0</span>
                        </DialogDescription>
                    </div>
                </div>
            </DialogHeader>

            {/* Content: Consistent Spacing & Boxes */}
            <div className="flex-1 overflow-y-auto p-10 pt-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className="max-w-2xl mx-auto space-y-12">

                    {/* RECOMMENDED */}
                    <section className="space-y-6">
                        <div className={styles.section_title}>
                            <Settings className="w-5 h-5 text-blue-400" />
                            Recommended Instances
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{group.name}</span>
                                        <group.icon className="w-3.5 h-3.5 text-blue-400/30" />
                                    </div>
                                    <div className="space-y-2">
                                        {group.links.map((link, j) => (
                                            <a key={j} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-blue-500/10 text-[11px] font-bold text-white/70 hover:text-blue-400 border border-white/5 transition-all">
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
                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className={styles.step_badge}>01</div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Download Templates</h3>
                        </div>
                        <div className="ml-12 space-y-4">
                            <p className={styles.instruction}>
                                Download the JSON files from the <span className="text-blue-400 font-bold">UME Templates</span> menu. You'll need all three for the full setup:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="bg-white/5 border-white/10 text-white/60 px-2 py-1 flex gap-2 items-center text-[10px] font-bold uppercase tracking-tight">
                                    <Download className="w-3 h-3" /> AIOStreams
                                </Badge>
                                <Badge variant="outline" className="bg-white/5 border-white/10 text-white/60 px-2 py-1 flex gap-2 items-center text-[10px] font-bold uppercase tracking-tight">
                                    <Download className="w-3 h-3" /> AIOMetadata
                                </Badge>
                                <Badge variant="outline" className="bg-white/5 border-white/10 text-white/60 px-2 py-1 flex gap-2 items-center text-[10px] font-bold uppercase tracking-tight">
                                    <Download className="w-3 h-3" /> Omni Snapshot
                                </Badge>
                            </div>
                        </div>
                    </section>

                    {/* STEP 2: AIOSTREAMS */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className={styles.step_badge}>02</div>
                            <h3 className="text-xl font-bold text-white tracking-tight">AIOStreams Setup</h3>
                        </div>
                        <div className="ml-12 space-y-3">
                            {[
                                { text: "Open AIOStreams and go to **Save & Install**", icon: ExternalLink },
                                { text: "Select **Import** → **Import Template**", icon: Download },
                                { text: "Upload the AIOStreams JSON file", icon: CheckCircle2 },
                                { text: "Add your **API Keys** (Debrid, TMDB, TVDB)", icon: Key },
                            ].map((item, i) => (
                                <div key={i} className={styles.list_item}>
                                    <item.icon className="w-4 h-4 text-blue-400/50 mt-0.5" />
                                    <span className={styles.instruction} dangerouslySetInnerHTML={{ __html: item.text.replace(/\*\*(.*?)\*\*/g, `<b class="${styles.b}">$1</b>`) }} />
                                </div>
                            ))}
                            <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex gap-4">
                                <Save className="w-5 h-5 text-blue-400 shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Final Step</p>
                                    <p className="text-xs text-white/50 leading-relaxed italic">
                                        Set a password, click <span className="text-white font-bold">CREATE</span>, and save your <span className="text-white font-bold underline decoration-blue-500/50">UUID + Password</span>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* STEP 3: AIOMetadata */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className={styles.step_badge}>03</div>
                            <h3 className="text-xl font-bold text-white tracking-tight">AIOMetadata Setup</h3>
                        </div>
                        <div className="ml-12 space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                                <Info className="w-4 h-4 text-blue-400 shrink-0" />
                                <p className="text-[11px] text-white/40 font-bold uppercase tracking-tight">
                                    Copy AIOStreams manifest to <span className="text-white">Omni → Addons</span> first.
                                </p>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { text: "Import the **AIOMetadata Template** in the app", icon: Download },
                                    { text: "Add API keys (Click **MDBList icon** in catalogs for key)", icon: Key },
                                    { text: "Set password, save UUID and click **SAVE**", icon: CheckCircle2 },
                                ].map((item, i) => (
                                    <div key={i} className={styles.list_item}>
                                        <item.icon className="w-4 h-4 text-blue-400/50 mt-0.5" />
                                        <span className={styles.instruction} dangerouslySetInnerHTML={{ __html: item.text.replace(/\*\*(.*?)\*\*/g, `<b class="${styles.b}">$1</b>`) }} />
                                    </div>
                                ))}
                            </div>
                            <div className="text-[10px] text-white/30 italic text-center border-t border-white/5 pt-4">
                                Note: Already setup? Use **"Catalogs Only"** and import at Catalogs → Import Setup.
                            </div>
                        </div>
                    </section>

                    {/* STEP 4: OMNI */}
                    <section className="space-y-10">
                        <div className="flex items-center gap-4">
                            <div className={styles.step_badge}>04</div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Omni Snapshot Install</h3>
                        </div>
                        <div className="ml-12 space-y-10">
                            {/* iOS */}
                            <div className="space-y-5">
                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                                    <Smartphone className="w-4 h-4" /> iOS Device
                                </div>
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <span className="text-[10px] font-black text-blue-400/40 mt-1">STEP 1</span>
                                            <p className="text-xs text-white/60 leading-relaxed font-medium">Move JSON to: <br /> <code className="text-[10px] bg-white/5 px-2 py-1 rounded-md text-blue-400 mt-2 inline-block font-mono border border-white/5 tracking-tighter">Files › On my iPhone › Omni › Backups</code></p>
                                        </div>
                                        <div className="flex gap-4 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                                            <Info className="w-4 h-4 text-emerald-500 shrink-0" />
                                            <p className="text-[10px] text-emerald-200/40 leading-normal font-bold uppercase tracking-tight italic">Folder missing? Create a manual Snapshot in Omni first.</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <span className="text-[10px] font-black text-blue-400/40 mt-1">STEP 2</span>
                                            <p className="text-xs text-white font-bold leading-relaxed tracking-tight">
                                                <span className="text-red-500 underline decoration-red-500/20 underline-offset-4 uppercase">Force close Omni completely</span> and restart for the snapshot to appear.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Apple TV */}
                            <div className="space-y-5">
                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                                    <Tv className="w-4 h-4" /> Apple TV
                                </div>
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex items-start gap-5 hover:bg-white/[0.04] transition-all">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/10">
                                        <Cloud className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-xs font-bold text-white uppercase tracking-tight italic">iCloud Cloud Sync</p>
                                        <p className="text-[11px] text-white/40 leading-relaxed font-medium">
                                            Setup on iOS first. Push to <span className="text-blue-400 font-bold underline decoration-blue-500/20 underline-offset-4">iCloud</span> in Omni settings, then pull on Apple TV. Seamless and automatic.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Bottom Glow */}
            <div className="h-4 bg-gradient-to-t from-blue-500/5 to-transparent pointer-events-none sticky bottom-0" />
        </DialogContent>
    );
}
