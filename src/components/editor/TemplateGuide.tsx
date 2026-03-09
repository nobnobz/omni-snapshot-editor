"use client";

import React from "react";
import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
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
    Key
} from "lucide-react";

export function TemplateGuide() {
    // Shared style constants for consistency
    const boxStyles = "bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.05] transition-all duration-300";
    const itemStyles = "flex items-center gap-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] group hover:border-blue-500/30 transition-all duration-200";
    const titleStyles = "text-lg font-bold text-white tracking-tight mb-4 flex items-center gap-2.5";
    const stepLabelStyles = "inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-black text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)] mb-4";

    return (
        <DialogContent className="max-w-3xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-[#0a0a0a] border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            {/* Unified Premium Header */}
            <div className="relative overflow-hidden border-b border-white/5 bg-[#0d0d0d] p-8">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[120px] -mr-40 -mt-40 rounded-full animate-pulse" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] -ml-32 -mb-32 rounded-full" />

                <div className="relative flex items-center gap-6">
                    <div className="flex-shrink-0 w-16 h-16 rounded-[22px] bg-gradient-to-br from-blue-500 to-blue-600 p-[1px] shadow-lg shadow-blue-500/20">
                        <div className="w-full h-full rounded-[21px] bg-[#0d0d0d] flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <div>
                        <DialogTitle className="text-2xl font-black tracking-tighter text-white mb-1 uppercase">
                            Installation Guide
                        </DialogTitle>
                        <DialogDescription className="text-xs font-bold text-blue-400/60 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span>Unified Media Experience</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500/30" />
                            <span>V0.2.0 Setup</span>
                        </DialogDescription>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-10 pt-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className="max-w-2xl mx-auto space-y-16 py-4">

                    {/* Intro / Recommended */}
                    <section>
                        <h2 className={titleStyles}>
                            <Settings className="w-5 h-5 text-blue-400" />
                            Recommended Instances
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            ].map((box, i) => (
                                <div key={i} className={boxStyles}>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">{box.name}</span>
                                        <box.icon className="w-3.5 h-3.5 text-blue-400/40" />
                                    </div>
                                    <div className="space-y-2">
                                        {box.links.map((link, j) => (
                                            <a key={j} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] font-bold text-white/80 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/20 transition-all group">
                                                {link.text}
                                                <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-current transition-colors" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Step 1 */}
                    <section className="relative">
                        <div className={stepLabelStyles}>01</div>
                        <h3 className="text-xl font-black text-white tracking-tight mb-4">Download Templates</h3>
                        <p className="text-sm text-white/50 leading-relaxed mb-6">
                            Start by downloading the necessary JSON files from the <span className="text-blue-400 font-bold italic">UME Templates</span> menu.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {["AIOStreams", "AIOMetadata", "Omni Snapshot"].map((item, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                                    <Download className="w-5 h-5 text-blue-400/40" />
                                    <span className="text-[10px] font-black text-white/60 uppercase tracking-tighter">{item}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Step 2 */}
                    <section>
                        <div className={stepLabelStyles}>02</div>
                        <h3 className="text-xl font-black text-white tracking-tight mb-6">AIOStreams Setup</h3>
                        <div className="space-y-3 mb-6">
                            {[
                                { text: "Open AIOStreams and navigate to **Save & Install**", icon: ExternalLink },
                                { text: "Select **Import** → **Import Template**", icon: Download },
                                { text: "Upload the AIOStreams JSON file", icon: CheckCircle2 },
                                { text: "Add your **API Keys** (Debrid, TMDB, TVDB)", icon: Key },
                            ].map((step, i) => (
                                <div key={i} className={itemStyles}>
                                    <step.icon className="w-4 h-4 text-blue-400/60" />
                                    <span className="text-xs font-medium text-white/60" dangerouslySetInnerHTML={{ __html: step.text.replace(/\*\*(.*?)\*\*/g, '<b class="text-white font-bold">$1</b>') }} />
                                </div>
                            ))}
                        </div>
                        <div className="p-5 bg-blue-500/[0.03] border border-blue-500/20 rounded-2xl flex gap-4 items-start">
                            <Database className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Security Check</p>
                                <p className="text-xs text-white/60 leading-relaxed italic">
                                    Set a password, click <span className="text-white font-bold">CREATE</span>, and save your <span className="text-blue-400 font-bold">UUID + Password</span>.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Step 3 */}
                    <section>
                        <div className={stepLabelStyles}>03</div>
                        <h3 className="text-xl font-black text-white tracking-tight mb-4">AIOMetadata Setup</h3>
                        <p className="text-[11px] text-white/30 leading-relaxed mb-6 uppercase tracking-[0.1em] font-bold">
                            Prerequisite: Add AIOStreams Manifest URL to <span className="text-white/60">Omni → Addons</span>.
                        </p>
                        <div className="space-y-3 mb-6">
                            {[
                                { text: "Import the **AIOMetadata Template** in the app", icon: Download },
                                { text: "Add API keys (Click **MDBList icon** in catalogs for key)", icon: Key },
                                { text: "Set password, save UUID and click **SAVE**", icon: CheckCircle2 },
                            ].map((step, i) => (
                                <div key={i} className={itemStyles}>
                                    <step.icon className="w-4 h-4 text-blue-400/60" />
                                    <span className="text-xs font-medium text-white/60" dangerouslySetInnerHTML={{ __html: step.text.replace(/\*\*(.*?)\*\*/g, '<b class="text-white font-bold">$1</b>') }} />
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex gap-4 items-center">
                            <Info className="w-4 h-4 text-white/20 shrink-0" />
                            <p className="text-[10px] text-white/40 leading-normal italic font-medium">
                                Already setup? Download <span className="text-white/60">"Catalogs Only"</span> and import via <span className="text-white/60 italic">Catalogs → Import Setup</span>.
                            </p>
                        </div>
                    </section>

                    {/* Step 4 */}
                    <section>
                        <div className={stepLabelStyles}>04</div>
                        <h3 className="text-xl font-black text-white tracking-tight mb-8">Omni Snapshot Install</h3>
                        <div className="grid gap-8">
                            {/* iOS */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                                    <Smartphone className="w-4 h-4" /> iOS Device
                                </div>
                                <div className={boxStyles}>
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <span className="text-[10px] font-black text-blue-500/40 mt-1">STEP 1</span>
                                            <p className="text-xs text-white/70 leading-relaxed">Move `.json` to: <br /> <code className="text-[10px] bg-white/5 px-2 py-1 rounded-md text-blue-400 mt-2 inline-block font-mono border border-white/5">Files › On my iPhone › Omni › Backups</code></p>
                                        </div>
                                        <div className="h-px bg-white/5 mx-[-20px]" />
                                        <div className="flex gap-4">
                                            <span className="text-[10px] font-black text-blue-500/40 mt-1">STEP 2</span>
                                            <p className="text-xs text-white/90 font-bold leading-relaxed">
                                                <span className="text-red-500/90 underline decoration-red-500/20 underline-offset-4 uppercase tracking-tighter">Force close Omni completely</span><br />
                                                <span className="text-white/50 font-normal">Restart the app for the snapshot to appear.</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Apple TV */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                                    <Tv className="w-4 h-4" /> Apple TV
                                </div>
                                <div className={`${boxStyles} flex items-start gap-5`}>
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/10">
                                        <Cloud className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-xs font-bold text-white uppercase tracking-tight">iCloud Sync</p>
                                        <p className="text-[11px] text-white/40 leading-relaxed font-medium">
                                            Install on iOS first. Push to <span className="text-blue-400">iCloud</span> in settings, then pull on Apple TV. Seamless and fast.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Bottom Glow */}
            <div className="h-2 bg-gradient-to-t from-blue-500/5 to-transparent pointer-events-none" />
        </DialogContent>
    );
}
