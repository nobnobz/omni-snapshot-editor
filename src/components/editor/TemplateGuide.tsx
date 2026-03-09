"use client";

import React from "react";
import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    ExternalLink,
    Download,
    Settings,
    Smartphone,
    Tv,
    Info,
    CheckCircle2,
    Layers,
    Database,
    Cloud,
    ArrowRight,
    Key,
    FileJson,
    Zap,
    ChevronRight,
    Search
} from "lucide-react";

export function TemplateGuide() {
    return (
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-[#0a0a0a] border-white/5 shadow-2xl">
            {/* Premium Header */}
            <div className="relative overflow-hidden border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent p-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 blur-[80px] -ml-24 -mb-24 rounded-full" />

                <div className="relative flex items-center gap-5">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 p-[1px]">
                        <div className="w-full h-full rounded-[15px] bg-[#0a0a0a] flex items-center justify-center">
                            <Layers className="w-7 h-7 text-white" />
                        </div>
                    </div>
                    <div>
                        <DialogTitle className="text-2xl font-black tracking-tight text-white mb-1">
                            Installation Guide
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium text-white/40 flex items-center gap-2">
                            <span>Unified Media Experience</span>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <span className="text-blue-400/80 uppercase tracking-widest text-[10px] font-bold">Step-by-Step Setup</span>
                        </DialogDescription>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 pt-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className="max-w-2xl mx-auto space-y-12 py-6">

                    {/* Prerequisites */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Settings className="w-5 h-5 text-blue-400" />
                            <h2 className="text-lg font-bold text-white tracking-tight">Recommended Instances</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="bg-white/[0.02] border-white/5 hover:bg-white/[0.04] transition-colors overflow-hidden group">
                                <CardContent className="p-5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">AIOStreams</span>
                                        <Zap className="w-3 h-3 text-white/20 group-hover:text-blue-400 transition-colors" />
                                    </div>
                                    <div className="space-y-2">
                                        <a href="https://aiostreamsfortheweebsstable.midnightignite.me/stremio/configure" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-blue-500/10 text-xs font-semibold text-white/80 transition-all border border-white/5">
                                            Stable Instance <ChevronRight className="w-3 h-3 text-white/30" />
                                        </a>
                                        <a href="https://aiostreamsnightlyfortheweak.nhyira.dev/stremio/configure" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-blue-500/10 text-xs font-semibold text-white/80 transition-all border border-white/5">
                                            Nightly Instance <ChevronRight className="w-3 h-3 text-white/30" />
                                        </a>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/[0.02] border-white/5 hover:bg-white/[0.04] transition-colors overflow-hidden group">
                                <CardContent className="p-5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">AIOMetadata</span>
                                        <Search className="w-3 h-3 text-white/20 group-hover:text-emerald-400 transition-colors" />
                                    </div>
                                    <div className="space-y-2">
                                        <a href="https://aiometadatafortheweebs.midnightignite.me/configure/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-emerald-500/10 text-xs font-semibold text-white/80 transition-all border border-white/5">
                                            Stable Instance <ChevronRight className="w-3 h-3 text-white/30" />
                                        </a>
                                        <a href="https://aiometadatafortheweak.nhyira.dev/configure/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-emerald-500/10 text-xs font-semibold text-white/80 transition-all border border-white/5">
                                            Experimental <ChevronRight className="w-3 h-3 text-white/30" />
                                        </a>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Step 1: Download */}
                    <div className="relative pl-12">
                        <div className="absolute left-1 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-500 via-emerald-500 to-white/5" />
                        <div className="absolute left-[-11px] top-0 w-8 h-8 rounded-full bg-[#0a0a0a] border-2 border-blue-500 flex items-center justify-center text-xs font-black text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                            01
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white tracking-tight">Download Templates</h3>
                            <p className="text-sm text-white/50 leading-relaxed">
                                Get the core components from the <span className="text-blue-400 font-bold italic">UME Templates</span> menu. You will need:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="bg-blue-500/5 border-blue-500/20 text-blue-400 px-2 py-1 flex gap-2 items-center">
                                    <FileJson className="w-3 h-3" /> AIOStreams
                                </Badge>
                                <Badge variant="outline" className="bg-emerald-500/5 border-emerald-500/20 text-emerald-400 px-2 py-1 flex gap-2 items-center">
                                    <FileJson className="w-3 h-3" /> AIOMetadata
                                </Badge>
                                <Badge variant="outline" className="bg-white/5 border-white/10 text-white/80 px-2 py-1 flex gap-2 items-center">
                                    <FileJson className="w-3 h-3" /> Omni Snapshot
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: AIOStreams */}
                    <div className="relative pl-12">
                        <div className="absolute left-1 top-[-20px] bottom-0 w-[2px] bg-white/5" />
                        <div className="absolute left-[-11px] top-0 w-8 h-8 rounded-full bg-[#0a0a0a] border-2 border-emerald-500 flex items-center justify-center text-xs font-black text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                            02
                        </div>
                        <div className="space-y-5">
                            <h3 className="text-xl font-bold text-white tracking-tight">Configure AIOStreams</h3>

                            <div className="grid gap-3">
                                {[
                                    { text: "Open AIOStreams and go to **Save & Install**", icon: ExternalLink },
                                    { text: "Select **Import** → **Import Template**", icon: Download },
                                    { text: "Upload the AIOStreams JSON file", icon: CheckCircle2 },
                                    { text: "Add your **API Keys** (Debrid, TMDB, TVDB)", icon: Key },
                                ].map((step, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 group hover:border-emerald-500/30 transition-colors">
                                        <step.icon className="w-4 h-4 text-emerald-400/50 group-hover:text-emerald-400 transition-colors" />
                                        <span className="text-xs font-medium text-white/60" dangerouslySetInnerHTML={{ __html: step.text.replace(/\*\*(.*?)\*\*/g, '<b class="text-white">$1</b>') }} />
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl space-y-2">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">
                                    <Database className="w-3 h-3" /> finalize setup
                                </div>
                                <p className="text-xs text-white/70 leading-relaxed font-medium">
                                    Set a password, click <span className="text-emerald-400 font-bold font-mono">CREATE</span>, and securely save your <span className="text-white underline decoration-emerald-500/50 underline-offset-4 font-black tracking-tight">UUID + Password</span>.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Step 3: AIOMetadata */}
                    <div className="relative pl-12">
                        <div className="absolute left-1 top-[-20px] bottom-0 w-[2px] bg-white/5" />
                        <div className="absolute left-[-11px] top-0 w-8 h-8 rounded-full bg-[#0a0a0a] border-2 border-blue-400 flex items-center justify-center text-xs font-black text-white shadow-[0_0_15px_rgba(96,165,250,0.3)]">
                            03
                        </div>
                        <div className="space-y-5">
                            <h3 className="text-xl font-bold text-white tracking-tight">Setup AIOMetadata</h3>

                            <p className="text-xs text-white/40 leading-relaxed italic border-l-2 border-white/5 pl-4 py-1">
                                First, add your **AIOStreams Manifest URL** into <span className="text-white font-bold">Omni → Addons</span>.
                            </p>

                            <div className="grid gap-3">
                                {[
                                    { text: "Import the **AIOMetadata Template** in the app", icon: Download },
                                    { text: "Enter API keys (Click **MDBList icon** in catalogs for its key)", icon: Key },
                                    { text: "Set password, save UUID and click **SAVE**", icon: CheckCircle2 },
                                ].map((step, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 group hover:border-blue-400/30 transition-colors">
                                        <step.icon className="w-4 h-4 text-blue-400/50 group-hover:text-blue-400 transition-colors" />
                                        <span className="text-xs font-medium text-white/60" dangerouslySetInnerHTML={{ __html: step.text.replace(/\*\*(.*?)\*\*/g, '<b class="text-white">$1</b>') }} />
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3 items-center p-3 bg-blue-500/5 border border-white/5 rounded-xl">
                                <Info className="w-4 h-4 text-blue-400 shrink-0" />
                                <p className="text-[10px] text-white/50 leading-normal">
                                    Already have AIOMetadata? Download <span className="text-blue-300 font-bold">"Catalogs Only"</span> and import via <span className="text-white italic">Catalogs → Import Setup</span>.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Step 4: Omni */}
                    <div className="relative pl-12">
                        <div className="absolute left-1 top-[-20px] bottom-[-20px] w-[2px] bg-white/5" />
                        <div className="absolute left-[-11px] top-0 w-8 h-8 rounded-full bg-[#0a0a0a] border-2 border-white/40 flex items-center justify-center text-xs font-black text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                            04
                        </div>
                        <div className="space-y-8">
                            <h3 className="text-xl font-bold text-white tracking-tight">Omni Snapshot Install</h3>

                            {/* iOS Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                    <Smartphone className="w-3.5 h-3.5" /> iOS Workflow
                                </div>
                                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                                    <div className="space-y-3 text-sm text-white/60">
                                        <div className="flex gap-4">
                                            <span className="text-[10px] font-mono font-black text-white/20 mt-1">STEP1</span>
                                            <p>Copy the `.json` and move it to: <br /> <code className="text-[11px] bg-white/5 px-2 py-1 rounded text-blue-300 mt-2 inline-block">Files › On my iPhone › Omni › Backups</code></p>
                                        </div>
                                        <div className="flex gap-4 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl my-2">
                                            <Info className="w-4 h-4 text-emerald-500 shrink-0" />
                                            <p className="text-[11px] text-emerald-200/60 leading-normal">Missing the folder? Create a manual Snapshot in Omni first, then it appears automatically.</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <span className="text-[10px] font-mono font-black text-white/20 mt-1">STEP2</span>
                                            <p className="font-bold text-white"><span className="text-red-400">Force close Omni completely</span> and restart for the snapshot to show in the list.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Apple TV Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                    <Tv className="w-3.5 h-3.5" /> Apple TV Sync
                                </div>
                                <div className="relative group overflow-hidden rounded-2xl p-[1px] bg-gradient-to-br from-white/10 to-transparent">
                                    <div className="bg-[#0f0f0f] rounded-[15px] p-6 flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                            <Cloud className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-xs font-bold text-white">iCloud Cloud Sync (Recommended)</p>
                                            <p className="text-[11px] text-white/50 leading-relaxed">
                                                Import the snapshot on your iOS device first. Go to settings, push to <span className="text-blue-400 font-bold">iCloud</span>, and then pull it on your Apple TV. Pure magic.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subtle Footer-less Finish */}
            <div className="h-4 bg-gradient-to-t from-white/[0.02] to-transparent pointer-events-none" />
        </DialogContent>
    );
}
