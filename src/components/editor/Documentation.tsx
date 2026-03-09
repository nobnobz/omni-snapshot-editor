"use client";

import React from 'react';
import {
    BookOpen,
    Upload,
    Settings,
    Layers,
    Database,
    Download,
    FileJson,
    MousePointer2,
    AlertCircle,
    HelpCircle,
    Hash,
    Star,
    Layout,
    LayoutGrid,
    Trash2,
    RefreshCcw,
    PlusCircle,
    ExternalLink,
    ShieldCheck,
    CheckCircle2,
    WandSparkles,
    Maximize,
    Palette,
    Type,
    Image as ImageIcon,
    Hexagon
} from 'lucide-react';
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export function Documentation() {
    return (
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-background border-border text-foreground scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
            <DialogHeader className="border-b border-border pb-6 mb-6">
                <DialogTitle className="text-3xl font-extrabold flex items-center gap-3 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                    <BookOpen className="w-8 h-8 text-blue-500" />
                    Omni Snapshot Manager - Master Guide
                </DialogTitle>
                <p className="text-muted-foreground text-sm mt-2">The complete manual for managing your Omni setup without headaches.</p>
            </DialogHeader>

            <div className="space-y-12 pb-10">
                {/* CHAPTER 1: THE START PAGE */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <MousePointer2 className="w-6 h-6 text-blue-500" />
                        1. The Start Page
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        When you launch the Omni Config Editor, you have three main ways to begin your session:
                    </p>
                    <div className="flex flex-col gap-4">
                        <div className="bg-card/50 p-4 rounded-xl border border-border hover:border-blue-500/30 transition-colors">
                            <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2 text-sm">
                                <Upload className="w-4 h-4" />
                                Custom Import
                            </h4>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Upload your existing <strong>.json</strong> configuration file. This is the best way to continue working on your own setup or to modify a backup.
                            </p>
                        </div>
                        <div className="bg-card/50 p-4 rounded-xl border border-border hover:border-blue-500/30 transition-colors">
                            <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2 text-sm">
                                <ExternalLink className="w-4 h-4" />
                                From GitHub
                            </h4>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Enter a URL to a <strong>raw .json file</strong> on GitHub. This is perfect for loading public templates or configurations hosted online.
                            </p>
                        </div>
                        <div className="bg-card/50 p-4 rounded-xl border border-border hover:border-blue-500/30 transition-colors">
                            <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2 text-sm">
                                <PlusCircle className="w-4 h-4" />
                                Start Fresh
                            </h4>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Begin with a completely empty configuration. Use this if you want to build your setup from scratch without any pre-existing groups or catalogs.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CHAPTER 2: AIOMetadata INTEGRATION */}
                <section className="space-y-4 bg-blue-500/5 p-6 rounded-2xl border border-blue-500/20">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <Database className="w-6 h-6 text-blue-400" />
                            2. AIOMetadata Integration
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Why is this needed?
                            </h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Omni doesn’t store the names of your AIOMetadata catalogs directly. Instead, it only saves the MDBList ID. My AIOMetadata catalogs are included as a fallback by default, so the correct catalog names are still displayed.
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                If you want to use your <strong>own custom catalogs</strong> or personal AIOMetadata setup, you should upload your specific mapping here.
                            </p>
                        </div>

                        <div className="space-y-4 bg-background/40 p-4 rounded-xl border border-border/50">
                            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <HelpCircle className="w-4 h-4 text-blue-400" />
                                How to export from AIOMetadata?
                            </h4>
                            <ol className="space-y-2 ml-4 list-decimal text-[11px] text-muted-foreground">
                                <li>Open your <strong>AIOMetadata</strong> app.</li>
                                <li>Navigate to the <strong>Catalogs</strong> section.</li>
                                <li>Click on <strong>Share Setup</strong>.</li>
                                <li>Choose <strong>Download JSON</strong> or <strong>Copy to Clipboard</strong>.</li>
                                <li>Upload or paste that data here in the integration section.</li>
                            </ol>
                        </div>
                    </div>
                </section>

                {/* CHAPTER 3: GROUPS MANAGER */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Layers className="w-6 h-6 text-blue-500" />
                        3. Groups Manager
                    </h2>
                    <p className="text-sm text-muted-foreground">Manage your <strong>Main Groups</strong> (Navigation bar) and <strong>Subgroups</strong> (individual rows).</p>

                    <div className="space-y-6">
                        <div className="flex flex-col gap-4">
                            <div className="bg-card/50 p-4 rounded-xl border border-border hover:border-blue-500/30 transition-colors">
                                <h4 className="font-bold text-blue-400 text-xs mb-2 flex items-center gap-2">
                                    <PlusCircle className="w-3.5 h-3.5" />
                                    Create New Group
                                </h4>
                                <p className="text-[10px] text-muted-foreground leading-relaxed">
                                    Adds a fresh <strong>Main Group</strong> to your setup. You can name it and immediately assign existing subgroups to it.
                                </p>
                            </div>
                            <div className="bg-card/50 p-4 rounded-xl border border-border hover:border-blue-500/30 transition-colors">
                                <h4 className="font-bold text-blue-400 text-xs mb-2 flex items-center gap-2">
                                    <LayoutGrid className="w-3.5 h-3.5" />
                                    Add to Group
                                </h4>
                                <p className="text-[10px] text-muted-foreground leading-relaxed">
                                    Lets you pick from your <strong>Unassigned Subgroups</strong> and move them into a specific Main Group.
                                </p>
                            </div>
                            <div className="bg-card/50 p-4 rounded-xl border border-border hover:border-blue-500/30 transition-colors">
                                <h4 className="font-bold text-blue-400 text-xs mb-2 flex items-center gap-2">
                                    <RefreshCcw className="w-3.5 h-3.5" />
                                    Update from Template
                                </h4>
                                <p className="text-[10px] text-muted-foreground leading-relaxed">
                                    Syncs groups from a template while keeping your custom groups intact. Use it to import groups from another setup or update existing ones.
                                </p>
                            </div>
                        </div>

                        <div className="bg-blue-500/5 border border-blue-500/20 p-5 rounded-xl">
                            <h4 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
                                <Settings className="w-4 h-4 text-blue-400" />
                                Customization Options
                            </h4>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                                <li className="text-[11px] text-muted-foreground flex gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                    <span><strong>Layout:</strong> Toggle between <strong>Poster</strong>, <strong>Square</strong>, or <strong>Landscape</strong> view per group.</span>
                                </li>
                                <li className="text-[11px] text-muted-foreground flex gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                    <span><strong>Images:</strong> Set custom background images for every subgroup.</span>
                                </li>
                                <li className="text-[11px] text-muted-foreground flex gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                    <span><strong>Linking:</strong> Manage which <strong>Catalogs</strong> belong to which subgroup by dragging or using the "Add" menu.</span>
                                </li>
                                <li className="text-[11px] text-muted-foreground flex gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                    <span><strong>Drag & Drop:</strong> Reorder everything instantly.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* CHAPTER 4: CATALOGS MANAGER */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Star className="w-6 h-6 text-blue-500" />
                        4. Catalogs Manager
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Control how individual catalogs appear below your groups.
                    </p>
                    <div className="bg-card/50 p-5 rounded-2xl border border-border space-y-5">
                        <div className="flex gap-4">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <Layout className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-foreground text-sm">Shelf Visibility</h4>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    Enable catalogs to show them at the bottom of the home screen.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                <Hash className="w-5 h-5 text-amber-500" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-foreground text-sm">Top Row (Featured)</h4>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    Promote specific catalogs to the <strong>Top Row</strong> (numbered items).
                                    <br />
                                    <span className="text-blue-400 font-medium">Pro Tip:</span> You can enable <strong>Top Row</strong> but set <strong>Show in Shelf</strong> to OFF. This tracks the row at the top while keeping the rest of the home screen clean!
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CHAPTER 5: GENERAL SETTINGS */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Settings className="w-6 h-6 text-blue-500" />
                        5. General Settings
                    </h2>
                    <div className="space-y-3">
                        {[
                            { label: "Hide Spoilers", desc: "Blurs descriptions and images for new episodes to avoid spoilers." },
                            { label: "External Playback Prompt", desc: "Keep it on if you use external players or need Trakt tracking." },
                            { label: "MDBList Rating Icons", desc: "Shows IMDb and Rotten Tomatoes ratings directly in your rows." },
                            { label: "Preferred Language", desc: "Sets the default audio and subtitle language for your library." },
                            { label: "Force Landscape", desc: "A global override to force all rows to use wide posters." }
                        ].map((s, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-card/30 border border-border rounded-lg hover:border-blue-500/20 transition-colors group">
                                <div>
                                    <h5 className="text-sm font-bold text-foreground group-hover:text-blue-400 transition-colors">{s.label}</h5>
                                    <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                                </div>
                                <ShieldCheck className="w-4 h-4 text-blue-500/20 group-hover:text-blue-500/50 transition-colors" />
                            </div>
                        ))}
                    </div>
                </section>

                {/* CHAPTER 6: PATTERNS & REGEX */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <WandSparkles className="w-6 h-6 text-blue-500" />
                        6. Patterns & Regex Tags
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Fine-tune how your content is metadata-tagged and displayed using Regular Expressions.
                    </p>
                    <div className="space-y-6">
                        <div className="bg-blue-500/5 border border-border p-5 rounded-2xl space-y-5">
                            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-blue-400" />
                                What can you do with Patterns?
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 p-3 bg-background/50 rounded-xl border border-border/50">
                                    <h5 className="text-[11px] font-bold text-blue-400 flex items-center gap-2">
                                        <Type className="w-3.5 h-3.5" />
                                        Custom Overrides
                                    </h5>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                                        Use <strong>Custom Name</strong> to rename technical metadata tags (e.g. rename "2160p" to "4K Ultra HD") or <strong>Image URL</strong> to assign custom icons.
                                    </p>
                                </div>
                                <div className="space-y-2 p-3 bg-background/50 rounded-xl border border-border/50">
                                    <h5 className="text-[11px] font-bold text-blue-400 flex items-center gap-2">
                                        <Hexagon className="w-3.5 h-3.5" />
                                        Styling Control
                                    </h5>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                                        Every tag can have a unique <strong>Background Color (Hex)</strong>. Use this to color-code qualities or release types.
                                    </p>
                                </div>
                                <div className="space-y-2 p-3 bg-background/50 rounded-xl border border-border/50">
                                    <h5 className="text-[11px] font-bold text-blue-400 flex items-center gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Visibility Toggles
                                    </h5>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                                        Toggle <strong>Display Tag</strong> to hide noisy metadata while keeping important indicators visible.
                                    </p>
                                </div>
                                <div className="space-y-2 p-3 bg-background/50 rounded-xl border border-border/50">
                                    <h5 className="text-[11px] font-bold text-blue-400 flex items-center gap-2">
                                        <Maximize className="w-3.5 h-3.5" />
                                        Global Design
                                    </h5>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                                        Manage <strong>Corner Radius</strong> (0-14px) and <strong>Icon Tinting</strong> (Black, White, Original) for all metadata tags at once.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-muted/30 border border-dashed border-border rounded-xl">
                            <h4 className="text-[11px] font-bold text-foreground mb-2">Advanced: Regex Logic</h4>
                            <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                                Examples: <code>/1080p/</code> matches any 1080p content. You can use <code>/BluRay|Web-DL/</code> to group multiple sources under a single "HD" custom name and icon mapping.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CHAPTER 7: SAVE & PARTIAL EXPORTS */}
                <section className="space-y-4 border-t border-border pt-8">
                    <h2 className="text-xl font-bold text-emerald-500 flex items-center gap-2">
                        <Download className="w-6 h-6" />
                        7. Finalizing & Saving
                    </h2>
                    <div className="bg-card p-6 rounded-2xl border border-border space-y-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <FileJson className="w-20 h-20 text-emerald-500" />
                        </div>

                        <p className="text-sm text-foreground leading-relaxed relative z-10">
                            When you're finished, export your configuration to apply it to your Omni App.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                            <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                                <h5 className="text-xs font-bold text-emerald-400 mb-2">Full Export</h5>
                                <p className="text-[10px] text-muted-foreground">Downloads your entire configuration as a single <strong>.json</strong> file.</p>
                            </div>
                            <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                                <h5 className="text-xs font-bold text-blue-400 mb-2 flex items-center gap-2">
                                    Partial Exports
                                </h5>
                                <p className="text-[10px] text-muted-foreground">You can also export <strong>only specific sections</strong> (e.g. just Groups or just Patterns) if you want to merge them into another setup later.</p>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex gap-3">
                            <HelpCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                                <h5 className="text-xs font-bold text-emerald-400 mb-1">Automatic Cleanup</h5>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    Every export automatically cleans up unused data and validates your structure. No manual fixing required!
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="text-center pt-8 border-t border-border">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest bg-card inline-block px-4 py-1 rounded-full border border-border">
                        Omni Snapshot Manager v0.1.0 • by Bot-Bid-Raiser
                    </p>
                </footer>
            </div>
        </DialogContent>
    );
}
