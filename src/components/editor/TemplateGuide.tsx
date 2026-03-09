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
    Cloud
} from "lucide-react";

export function TemplateGuide() {
    return (
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-[#0f0f0f] border-border/40">
            <DialogHeader className="p-6 pb-2 border-b border-border/10">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Layers className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <DialogTitle className="text-xl font-bold tracking-tight text-foreground">How to Install</DialogTitle>
                        <DialogDescription className="text-sm text-foreground/50">
                            Unified Media Experience (UME) Setup Guide
                        </DialogDescription>
                    </div>
                </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6 pt-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className="space-y-8 py-4">
                    {/* Requirements Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-blue-400 mb-4">
                            <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Prerequisites</Badge>
                        </div>
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            <Settings className="w-4 h-4 text-blue-400" />
                            Recommended Instances
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Card className="bg-muted/30 border-border/20">
                                <CardContent className="p-4 space-y-2">
                                    <span className="text-xs font-bold text-foreground/80 block uppercase tracking-tight">AIOStreams</span>
                                    <div className="space-y-1">
                                        <a href="https://aiostreamsfortheweebsstable.midnightignite.me/stremio/configure" target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-400 hover:underline flex items-center gap-1">Stable Instance <ExternalLink className="w-3 h-3" /></a>
                                        <a href="https://aiostreamsnightlyfortheweak.nhyira.dev/stremio/configure" target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-400 hover:underline flex items-center gap-1">Nightly Instance <ExternalLink className="w-3 h-3" /></a>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-muted/30 border-border/20">
                                <CardContent className="p-4 space-y-2">
                                    <span className="text-xs font-bold text-foreground/80 block uppercase tracking-tight">AIOMetadata</span>
                                    <div className="space-y-1">
                                        <a href="https://aiometadatafortheweebs.midnightignite.me/configure/" target="_blank" rel="noopener noreferrer" className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1">Stable Instance <ExternalLink className="w-3 h-3" /></a>
                                        <a href="https://aiometadatafortheweak.nhyira.dev/configure/" target="_blank" rel="noopener noreferrer" className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1">Experimental <ExternalLink className="w-3 h-3" /></a>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Step 1 */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 bg-blue-500/20 rounded-full flex items-center justify-center text-xs font-bold text-blue-400 border border-blue-500/20">1</div>
                            <h3 className="font-bold text-base">Download the Files</h3>
                        </div>
                        <p className="text-sm text-foreground/60 leading-relaxed ml-10">
                            Download the JSON files from the <span className="text-foreground font-medium italic">UME Templates</span> menu. To use my full setup, you will need the <span className="text-blue-400 font-medium whitespace-nowrap">AIOStreams</span>, <span className="text-emerald-400 font-medium whitespace-nowrap">AIOMetadata</span> and <span className="text-foreground font-medium whitespace-nowrap">Omni Snapshot</span> templates.
                        </p>
                    </section>

                    {/* Step 2 & 3 */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 bg-blue-500/20 rounded-full flex items-center justify-center text-xs font-bold text-blue-400 border border-blue-500/20">2</div>
                            <h3 className="font-bold text-base">AIOStreams Configuration</h3>
                        </div>
                        <div className="ml-10 space-y-4">
                            <div className="p-4 bg-muted/20 border border-border/10 rounded-xl space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-foreground/40">Loading the Template</h4>
                                <ul className="space-y-2 text-sm text-foreground/70">
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                        <span>Open your preferred **AIOStreams** instance.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                        <span>Go to **Save & Install** → **Import** → **Import Template**.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                        <span>Import the downloaded **AIOStreams template**.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                        <span>Add your **Debrid + TMDB + TVDB** API keys under Services.</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="p-4 border border-blue-500/20 bg-blue-500/5 rounded-xl space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-blue-400/60">Finalizing Setup</h4>
                                <ul className="space-y-2 text-sm text-foreground/80 font-medium">
                                    <li className="flex gap-2">
                                        <Database className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                        <span>Set an **Instance Password** and click **Create**.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                        <span className="text-blue-300">Save your **UUID + Password** securely!</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Step 4 & 5 */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 bg-emerald-500/20 rounded-full flex items-center justify-center text-xs font-bold text-emerald-400 border border-emerald-500/20">3</div>
                            <h3 className="font-bold text-base">AIOMetadata Configuration</h3>
                        </div>
                        <div className="ml-10 space-y-4 text-sm text-foreground/70 leading-relaxed">
                            <p>
                                Copy the manifest URL from your finished AIOStreams setup and add it to <span className="font-bold text-foreground underline decoration-blue-500/40 underline-offset-4">Omni → Addons</span>.
                            </p>
                            <div className="p-4 bg-muted/20 border border-border/10 rounded-xl space-y-3">
                                <ul className="space-y-2">
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                        <span>Open **AIOMetadata** and import my configuration.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                        <span>Add your API keys (don't forget **MDBList** via the icon in catalogs).</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                        <span>Set a password, save your **UUID**, and click **Save**.</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
                                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-blue-200/80 italic">
                                    **Note:** If you already have AIOMetadata and just want catalogs, download the "Catalogs Only" template and import it at Catalogs → Import Setup.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Step 6 */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 bg-foreground/10 rounded-full flex items-center justify-center text-xs font-bold text-foreground border border-foreground/10">4</div>
                            <h3 className="font-bold text-base">Import the Omni Snapshot</h3>
                        </div>
                        <div className="ml-10 space-y-6">
                            <p className="text-sm text-foreground/60 leading-relaxed">
                                Use the **Omni Snapshot Manager** to update your setup. If you don't want to personalize the setup, you can skip this part.
                            </p>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold flex items-center gap-2 text-foreground/80 tracking-tight">
                                    <Smartphone className="w-4 h-4 text-blue-400" />
                                    iOS Installation
                                </h4>
                                <ul className="space-y-2 text-sm text-foreground/70 ml-2">
                                    <li className="flex gap-2">
                                        <span className="text-xs text-foreground/30 font-mono mt-0.5">01</span>
                                        <span>Copy the `.json` file using the **Files App**.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-xs text-foreground/30 font-mono mt-0.5">02</span>
                                        <span>Paste into: **Files › On my iPhone › Omni › Backups**.</span>
                                    </li>
                                    <li className="flex gap-1.5 p-2 bg-yellow-500/5 border border-yellow-500/10 rounded-lg text-[11px]">
                                        <Info className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
                                        <span className="text-yellow-200/70">If the folder is missing, create a manual Snapshot in the Omni app first.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-xs text-foreground/30 font-mono mt-0.5">03</span>
                                        <span className="font-bold text-foreground/90 underline decoration-red-500/30 underline-offset-4">Force close Omni completely** and restart the app for it to appear.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold flex items-center gap-2 text-foreground/80 tracking-tight">
                                    <Tv className="w-4 h-4 text-blue-400" />
                                    Apple TV Sync
                                </h4>
                                <div className="p-4 bg-muted/10 border border-border/10 rounded-xl space-y-3">
                                    <div className="flex items-start gap-3">
                                        <Cloud className="w-5 h-5 text-blue-400 shrink-0" />
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-foreground/90">The easiest way using iCloud:</p>
                                            <ul className="space-y-1 text-xs text-foreground/60 list-decimal list-inside">
                                                <li>Import binary to your iOS device first.</li>
                                                <li>Push settings to **iCloud** in Omni settings.</li>
                                                <li>Pull data on the **Apple TV** afterwards.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <div className="p-6 border-t border-border/10 flex justify-between items-center bg-muted/5">
                <p className="text-[10px] text-foreground/40 italic">
                    Simplified for v0.2.0 • Unified Media Experience
                </p>
                <div className="flex gap-2">
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-border/40">iOS 16+</Badge>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-border/40">tvOS 16+</Badge>
                </div>
            </div>
        </DialogContent>
    );
}
