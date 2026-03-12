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
    Image as ImageIcon,
    Monitor,
    Smartphone,
    UploadCloud
} from 'lucide-react';
import { useConfig } from "@/context/ConfigContext";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { downloadTemplateFile } from "@/lib/template-download";
import { editorLayout } from "@/components/editor/ui/style-contract";

export function Documentation() {
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
            <DialogHeader className="border-b border-border pb-8 mb-8">
                <DialogTitle className="text-3xl font-extrabold flex items-center gap-4 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                    <BookOpen className="w-10 h-10 text-blue-500" />
                    Omni Snapshot Manager - Master Guide
                </DialogTitle>
                <p className="text-foreground/70 text-sm mt-3">The complete manual for managing your Omni setup.</p>
            </DialogHeader>

            <div className="space-y-16 pb-12">
                {/* PREREQUISITE WARNING */}
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-5 rounded-2xl flex items-start gap-4">
                    <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-base font-bold text-amber-700 dark:text-amber-500 mb-1.5">Prerequisite</h4>
                        <p className="text-sm text-foreground/80 leading-relaxed">
                            You need to install the <strong>AIOMetadata Addon</strong> on Omni for the Snapshot to function correctly. You can use my template from <a href="https://github.com/nobnobz/Omni-Template-Bot-Bid-Raiser" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-bold">here <ExternalLink className="w-3 h-3" /></a>.
                        </p>
                    </div>
                </div>

                {/* CHAPTER 1: THE START PAGE */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                        <MousePointer2 className="w-7 h-7 text-blue-500" />
                        1. The Start Page
                    </h2>
                    <p className="text-sm text-foreground/70 leading-relaxed">
                        When you launch the Omni Config Editor, you have three main ways to begin your session:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-card/50 p-6 rounded-2xl border border-border hover:border-blue-500/30 transition-colors">
                            <h4 className="font-bold text-blue-400 mb-2.5 flex items-center gap-2 text-sm uppercase tracking-wide">
                                <Upload className="w-4 h-4" />
                                Custom Import
                            </h4>
                            <p className="text-sm text-foreground/70 leading-relaxed">
                                Upload your existing <strong>.json</strong> configuration file. This is the best way to continue working on your own setup or to modify a template.
                            </p>
                        </div>
                        <div className="bg-card/50 p-6 rounded-2xl border border-border hover:border-blue-500/30 transition-colors">
                            <h4 className="font-bold text-blue-400 mb-2.5 flex items-center gap-2 text-sm uppercase tracking-wide">
                                <ExternalLink className="w-4 h-4" />
                                From GitHub
                            </h4>
                            <p className="text-sm text-foreground/70 leading-relaxed">
                                Enter a URL to a <strong>raw .json file</strong> on GitHub. This is perfect for loading public templates or configurations hosted online like my own.
                            </p>
                        </div>
                        <div className="bg-card/50 p-6 rounded-2xl border border-border hover:border-blue-500/30 transition-colors">
                            <h4 className="font-bold text-blue-400 mb-2.5 flex items-center gap-2 text-sm uppercase tracking-wide">
                                <PlusCircle className="w-4 h-4" />
                                Start Fresh
                            </h4>
                            <p className="text-sm text-foreground/70 leading-relaxed">
                                Begin with a completely empty configuration. Use this if you want to build your setup from scratch without any pre-existing groups or catalogs.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CHAPTER 2: AIOMetadata INTEGRATION */}
                <section className="space-y-6 bg-blue-50 dark:bg-blue-500/5 p-8 rounded-3xl border border-blue-100 dark:border-blue-500/20">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                            <Database className="w-7 h-7 text-blue-400" />
                            2. AIOMetadata Integration
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="text-base font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                Why is this needed?
                            </h4>
                            <p className="text-sm text-foreground/70 leading-relaxed">
                                Omni doesn’t store the names of your AIOMetadata catalogs directly. Instead, it only saves the MDBList ID. My AIOMetadata catalogs are included as a fallback by default, so the correct catalog names are still displayed.
                            </p>
                            <p className="text-sm text-foreground/70 leading-relaxed">
                                If you want to use your <strong>own custom catalogs</strong> or personal AIOMetadata setup, you should upload your specific mapping here.
                            </p>
                        </div>

                        <div className="space-y-4 bg-background/40 p-6 rounded-2xl border border-border/50">
                            <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                How to export from AIOMetadata?
                            </h4>
                            <ol className="space-y-3 ml-4 list-decimal text-sm text-foreground/70">
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
                <section className="space-y-6">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                        <Layers className="w-7 h-7 text-blue-500" />
                        3. Groups Manager
                    </h2>
                    <p className="text-sm text-foreground/70">Manage your <strong>Main Groups</strong> and <strong>Subgroups</strong> with visual clarity.</p>

                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-card/50 p-6 rounded-2xl border border-border hover:border-blue-500/30 transition-colors">
                                <h4 className="font-bold text-blue-400 text-sm mb-2.5 flex items-center gap-2">
                                    <PlusCircle className="w-4 h-4" />
                                    Create New Group
                                </h4>
                                <p className="text-sm text-foreground/70 leading-relaxed">
                                    Adds a fresh <strong>Main Group</strong> to your setup. You can name it and immediately assign existing subgroups to it.
                                </p>
                            </div>
                            <div className="bg-card/50 p-6 rounded-2xl border border-border hover:border-blue-500/30 transition-colors">
                                <h4 className="font-bold text-blue-400 text-sm mb-2.5 flex items-center gap-2">
                                    <LayoutGrid className="w-4 h-4" />
                                    Add to Group
                                </h4>
                                <p className="text-sm text-foreground/70 leading-relaxed">
                                    Lets you pick from your <strong>Unassigned Subgroups</strong> and move them into a specific Main Group.
                                </p>
                            </div>
                            <div className="bg-card/50 p-6 rounded-2xl border border-border hover:border-blue-500/30 transition-colors">
                                <h4 className="font-bold text-blue-400 text-sm mb-2.5 flex items-center gap-2">
                                    <RefreshCcw className="w-4 h-4" />
                                    Update from Template
                                </h4>
                                <p className="text-sm text-foreground/70 leading-relaxed">
                                    Syncs groups from a template while keeping your custom groups intact. Use it to import groups from another setup or update existing ones.
                                </p>
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 p-8 rounded-3xl">
                            <h4 className="font-bold text-foreground text-lg mb-4 flex items-center gap-3">
                                <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                Customization Options
                            </h4>
                            <ul className="space-y-4">
                                <li className="text-sm text-foreground/70 flex gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                                    <span><strong>Layout:</strong> Toggle between <strong>Poster</strong>, <strong>Square</strong>, or <strong>Landscape</strong> view per group.</span>
                                </li>
                                <li className="text-sm text-foreground/70 flex gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                                    <span><strong>Images:</strong> Set custom background images for every subgroup.</span>
                                </li>
                                <li className="text-sm text-foreground/70 flex gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                                    <span><strong>Linking:</strong> Manage which <strong>Catalogs</strong> belong to which subgroup by dragging or using the &quot;Add&quot; menu.</span>
                                </li>
                                <li className="text-sm text-foreground/70 flex gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                                    <span><strong>Drag & Drop:</strong> Reorder everything instantly in the groups list.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* CHAPTER 4: CATALOGS MANAGER */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                        <Star className="w-7 h-7 text-blue-500" />
                        4. Catalogs Manager
                    </h2>
                    <p className="text-sm text-foreground/70 leading-relaxed">
                        Control how individual catalogs appear below your groups.
                    </p>
                    <div className="bg-card/30 rounded-3xl border border-border overflow-hidden">
                        <div className="grid grid-cols-1 divide-y divide-border">
                            {/* Feature 1: Shelf Visibility */}
                            <div className="p-6 flex gap-5 hover:bg-white/[0.02] transition-colors">
                                <div className="h-12 w-12 shrink-0 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20">
                                    <Layout className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="space-y-1.5">
                                    <h4 className="font-bold text-foreground text-base tracking-tight">Shelf Visibility</h4>
                                    <p className="text-sm text-foreground/70 leading-relaxed">
                                        Enable catalogs to show them at the bottom of the home screen.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 2: Top Row */}
                            <div className="p-6 flex gap-5 hover:bg-white/[0.02] transition-colors">
                                <div className="h-12 w-12 shrink-0 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20">
                                    <Hash className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="space-y-1.5">
                                    <h4 className="font-bold text-foreground text-base tracking-tight">Top Row</h4>
                                    <p className="text-sm text-foreground/70 leading-relaxed">
                                        Promote specific catalogs to the Top Row to display them as a ranked list. You can enable Top Row while setting Show in Shelf to Off. This keeps the Top Row visible at the top while preventing those catalogs from appearing elsewhere on the home screen.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 3: Header Feature */}
                            <div className="p-6 flex gap-5 hover:bg-white/[0.02] transition-colors">
                                <div className="h-12 w-12 shrink-0 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20">
                                    <Maximize className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="space-y-1.5">
                                    <h4 className="font-bold text-foreground text-base tracking-tight">Header Feature</h4>
                                    <p className="text-sm text-foreground/70 leading-relaxed">
                                        Show catalogs as a large prominently featured header at the very top.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 4: Randomize */}
                            <div className="p-6 flex gap-5 hover:bg-white/[0.02] transition-colors">
                                <div className="h-12 w-12 shrink-0 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20">
                                    <RefreshCcw className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="space-y-1.5">
                                    <h4 className="font-bold text-foreground text-base tracking-tight">Randomize</h4>
                                    <p className="text-sm text-foreground/70 leading-relaxed">
                                        Shuffle the items within the catalog every time the app loads.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 5: Small Layout */}
                            <div className="p-6 flex gap-5 hover:bg-white/[0.02] transition-colors">
                                <div className="h-12 w-12 shrink-0 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20">
                                    <LayoutGrid className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="space-y-1.5">
                                    <h4 className="font-bold text-foreground text-base tracking-tight">Small Layout</h4>
                                    <p className="text-sm text-foreground/70 leading-relaxed">
                                        Use a condensed layout for catalogs with smaller posters.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CHAPTER 5: PATTERNS & REGEX */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                        <WandSparkles className="w-7 h-7 text-blue-500" />
                        5. Patterns & Regex Tags
                    </h2>
                    <p className="text-sm text-foreground/70 leading-relaxed">
                        Fine-tune how your content is tagged and displayed using tags and patterns.
                    </p>
                    <div className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-500/5 border border-border p-6 rounded-3xl space-y-6">
                            <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                What can you do with Patterns?
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 p-4 bg-background/50 rounded-2xl border border-border/50">
                                    <h5 className="text-sm font-bold text-blue-400 flex items-center gap-3">
                                        <RefreshCcw className="w-4 h-4" />
                                        Edit Existing Patterns
                                    </h5>
                                </div>
                                <div className="space-y-2 p-4 bg-background/50 rounded-2xl border border-border/50">
                                    <h5 className="text-sm font-bold text-blue-400 flex items-center gap-3">
                                        <PlusCircle className="w-4 h-4" />
                                        Create New Patterns
                                    </h5>
                                </div>
                                <div className="space-y-2 p-4 bg-background/50 rounded-2xl border border-border/50">
                                    <h5 className="text-sm font-bold text-blue-400 flex items-center gap-3">
                                        <Palette className="w-4 h-4" />
                                        Styling Controls
                                    </h5>
                                </div>
                                <div className="space-y-2 p-4 bg-background/50 rounded-2xl border border-border/50">
                                    <h5 className="text-sm font-bold text-blue-400 flex items-center gap-3">
                                        <ImageIcon className="w-4 h-4" />
                                        Custom Images
                                    </h5>
                                </div>
                                <div className="space-y-2 p-4 bg-background/50 rounded-2xl border border-border/50">
                                    <h5 className="text-sm font-bold text-blue-400 flex items-center gap-3">
                                        <Trash2 className="w-4 h-4 text-blue-400" />
                                        Bulk Actions
                                    </h5>
                                </div>
                                <div className="space-y-2 p-4 bg-background/50 rounded-2xl border border-border/50">
                                    <h5 className="text-sm font-bold text-blue-400 flex items-center gap-3">
                                        <Upload className="w-4 h-4" />
                                        Import and Export
                                    </h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CHAPTER 6: SAVE & PARTIAL EXPORTS */}
                <section className="space-y-6 border-t border-border pt-12">
                    <h2 className="text-xl font-bold text-emerald-500 flex items-center gap-3">
                        <Download className="w-7 h-7" />
                        6. Finalizing & Saving
                    </h2>
                    <div className="bg-card p-8 rounded-3xl border border-border space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <FileJson className="w-24 h-24 text-emerald-500" />
                        </div>

                        <p className="text-sm text-foreground leading-relaxed relative z-10">
                            When you&apos;re finished, export your configuration to load it to your Omni App.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                            <div className="bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/20">
                                <h5 className="text-sm font-bold text-emerald-400 mb-2">Full Export</h5>
                                <p className="text-sm text-foreground/70">Downloads your entire configuration as a single <strong>.json</strong> file.</p>
                            </div>
                            <div className="bg-blue-500/10 p-5 rounded-2xl border border-blue-500/20">
                                <h5 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                                    Partial Exports
                                </h5>
                                <p className="text-sm text-foreground/70">You can also export <strong>only specific sections</strong> (e.g. just Groups or just Patterns) if you want to import them into your existing setup.</p>
                            </div>
                        </div>

                        <div className="mt-4 p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-4 relative z-10">
                            <HelpCircle className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                                <h5 className="text-sm font-bold text-emerald-400 mb-1.5">Automatic Cleanup</h5>
                                <p className="text-sm text-foreground/70 leading-relaxed">
                                    Every export automatically cleans up unused data and validates your structure. No manual fixing required!
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CHAPTER 7: HOW TO INSTALL */}
                <section className="space-y-8 text-left">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                        <UploadCloud className="w-7 h-7 text-blue-500" />
                        7. How to install
                    </h2>

                    <div className="bg-blue-50 dark:bg-blue-500/5 p-8 rounded-3xl border border-blue-100 dark:border-blue-500/20 space-y-4">
                        <p className="text-sm text-foreground/70 leading-relaxed">
                            Access the <strong>UME Templates</strong> menu in the navigation bar or download these core files directly:
                        </p>
                        <div className="flex flex-wrap gap-2.5">
                                {templates.map((item, i) => {
                                    const parts = item.name.split('(');
                                    const mainTitle = parts[0].trim();
                                    const subtitle = parts[1] ? `(${parts[1]}` : null;

                                    return (
                                        <Button
                                            key={i}
                                            onClick={() => handleDownload(item.url, manifest?.templates?.find(t => t.id === item.id)?.name || item.name)}
                                            variant="outline"
                                            className="group h-auto min-h-12 items-center gap-3 rounded-xl border border-blue-200/80 bg-white/80 px-4 py-2.5 text-left text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/80 dark:border-blue-500/25 dark:bg-background/35 dark:hover:border-blue-400/45 dark:hover:bg-blue-500/10"
                                        >
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-500/10 ring-1 ring-inset ring-blue-500/25 transition-colors group-hover:bg-blue-500/15">
                                                <FileJson className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                            </div>
                                            <div className="flex flex-col items-start gap-0.5">
                                                <span className="text-sm font-extrabold leading-none tracking-tight">{mainTitle}</span>
                                                {subtitle && (
                                                    <span className="text-[11px] font-semibold text-foreground/55 lowercase tracking-normal">
                                                        {subtitle.toLowerCase()}
                                                    </span>
                                                )}
                                            </div>
                                        </Button>
                                    );
                                })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-card/30 p-8 rounded-3xl border border-border flex flex-col gap-6 hover:bg-card/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 shrink-0 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400">
                                    <Smartphone className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-foreground text-lg tracking-tight">Installation</h4>
                            </div>

                            <div className="space-y-5">
                                <ul className="space-y-4 text-sm text-foreground/70">
                                    <li className="flex gap-3 items-start">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 mt-1.5" />
                                        <span>Use the <strong>Files App</strong> on your device.</span>
                                    </li>
                                    <li className="space-y-3">
                                        <div className="flex gap-3 items-start">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 mt-1.5" />
                                            <span>Copy the <strong>.json</strong> file into the folder:</span>
                                        </div>
                                        <div className="bg-blue-50 dark:bg-background/80 px-4 py-3 rounded-2xl text-blue-600 dark:text-blue-400 font-mono text-xs border border-blue-100 dark:border-border/50 shadow-inner flex items-center gap-3 ml-4">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                                            Files › On my iPhone › Omni › Backups
                                        </div>
                                    </li>
                                    <li className="flex gap-3 items-start">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 mt-1.5" />
                                        <span>If the folder does not exist, manually create a <strong>Snapshot</strong> in Omni.</span>
                                    </li>
                                </ul>

                                <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-4 transition-all">
                                    <AlertCircle className="w-5 h-5 text-amber-500/70 shrink-0 mt-0.5" />
                                    <p className="text-sm leading-relaxed text-foreground/60 italic">
                                        <strong>Important:</strong> Force close Omni completely and restart for the snapshot to appear.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card/30 p-8 rounded-3xl border border-border flex flex-col gap-6 hover:bg-card/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 shrink-0 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400">
                                    <Monitor className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-foreground text-lg tracking-tight">Syncing with Apple TV</h4>
                            </div>
                            <div className="space-y-4">
                                <p className="text-sm text-foreground/70 leading-relaxed">
                                    Import the backup onto your <strong>iOS device</strong> first, enable <strong>iCloud Sync</strong>, then pull it on the Apple TV.
                                </p>
                                <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center gap-4">
                                    <CheckCircle2 className="w-5 h-5 text-blue-400/70 shrink-0" />
                                    <p className="text-sm text-foreground/60 italic">Seamless cloud transfer</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


            </div>
        </DialogContent>
    );
}
