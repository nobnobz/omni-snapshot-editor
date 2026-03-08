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
    CheckCircle2
} from 'lucide-react';
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function Documentation() {
    return (
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-neutral-950 border-neutral-800 text-neutral-100 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
            <DialogHeader className="border-b border-neutral-800 pb-6 mb-6">
                <DialogTitle className="text-3xl font-extrabold flex items-center gap-3 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                    <BookOpen className="w-8 h-8 text-blue-500" />
                    Omni Snapshot Manager - Master Guide
                </DialogTitle>
                <p className="text-neutral-500 text-sm mt-2">The complete manual for managing your Omni setup without headaches.</p>
            </DialogHeader>

            <div className="space-y-12 pb-10">
                {/* CHAPTER 1: THE BASICS */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <MousePointer2 className="w-6 h-6 text-blue-500" />
                        1. Getting Started & Navigation
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
                            <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                The Start Screen
                            </h4>
                            <p className="text-sm text-neutral-400 leading-relaxed">
                                When you first open the tool, you can either **Upload a JSON file** or **Enter a GitHub Link** (e.g., from my template). This loads your current settings into the editor.
                            </p>
                        </div>
                        <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
                            <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                                <RefreshCcw className="w-4 h-4" />
                                Back to Start
                            </h4>
                            <p className="text-sm text-neutral-400 leading-relaxed">
                                Made a mistake or want to load a different file? Click <strong>"Back to Start"</strong> in the top-right header to clear everything and go back to the upload screen.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CHAPTER 2: AIOMetadata */}
                <section className="space-y-4 bg-blue-900/5 p-6 rounded-2xl border border-blue-900/20">
                    <h2 className="text-xl font-bold text-blue-100 flex items-center gap-2">
                        <Database className="w-6 h-6 text-blue-400" />
                        2. AIOMetadata Integration
                    </h2>
                    <p className="text-sm text-neutral-400 leading-relaxed italic">
                        <strong>Goal:</strong> Automatically assign human-readable names to your catalogs.
                    </p>
                    <div className="space-y-3">
                        <div className="flex gap-4 items-start">
                            <div className="bg-blue-600 p-2 rounded-lg text-white font-bold shrink-0">A</div>
                            <div className="text-sm text-neutral-300">
                                <strong>Copy Setup from AIOMetadata:</strong> In the AIOMetadata app, go to <strong>Catalogs</strong> → <strong>Share Setup</strong>. You can either <strong>Download the .json</strong> or <strong>Copy to Clipboard</strong>.
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="bg-blue-600 p-2 rounded-lg text-white font-bold shrink-0">B</div>
                            <div className="text-sm text-neutral-300">
                                <strong>Import here:</strong> In the "AIOMetadata Integration" section, you have two cards. Use <strong>"Upload AIOMetadata"</strong> for files or <strong>"Paste JSON Content"</strong> if you copied the text. Click <strong>"Import from Paste"</strong> to apply it.
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 p-3 bg-red-900/20 border border-red-900/40 rounded text-red-300 text-xs flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        Note: You can skip this if you only want to use the default template names.
                    </div>
                </section>

                {/* CHAPTER 3: GROUPS MANAGER */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Layers className="w-6 h-6 text-blue-500" />
                        3. Groups Manager (The Main Menu)
                    </h2>
                    <p className="text-sm text-neutral-400">Manage your <strong>Main Groups</strong> (Navigation bar) and <strong>Subgroups</strong> (individual rows).</p>

                    <div className="space-y-4">
                        <div className="bg-blue-600/5 border border-blue-600/20 p-5 rounded-xl space-y-4">
                            <h4 className="font-bold text-blue-400 flex items-center gap-2">
                                <RefreshCcw className="w-4 h-4" />
                                Deep Dive: Update from Template
                            </h4>
                            <p className="text-xs text-neutral-300 leading-relaxed">
                                This is the most powerful feature for keeping your setup up-to-date. When you use <strong>Update from Template</strong> and select a template file, the editor performs a "Smart Merge":
                            </p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex gap-2 text-[11px] text-neutral-400">
                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1 shrink-0"></div>
                                    <span><strong>Updating Images:</strong> If a subgroup in your setup matches one in the template, it automatically updates the <strong>Background Image URL</strong> to the newest version from the template.</span>
                                </li>
                                <li className="flex gap-2 text-[11px] text-neutral-400">
                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1 shrink-0"></div>
                                    <span><strong>Syncing Catalogs:</strong> It checks if the template has added new catalogs to a subgroup. If so, those catalogs are added to your existing subgroup without removing any you already have.</span>
                                </li>
                                <li className="flex gap-2 text-[11px] text-neutral-400">
                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1 shrink-0"></div>
                                    <span><strong>Structure Preservation:</strong> Your custom <strong>Main Groups</strong> and your specific <strong>Ordering</strong> (sorting) are 100% preserved. The template only "injects" updates into your existing structure.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
                                <h4 className="font-bold text-neutral-200 text-sm mb-2 flex items-center gap-2">
                                    <LayoutGrid className="w-4 h-4 text-blue-400" />
                                    Reordering
                                </h4>
                                <p className="text-xs text-neutral-500 leading-relaxed">
                                    Simply drag the handles next to any group, subgroup, or catalog to change their order on your screen. Everything saves instantly in the editor.
                                </p>
                            </div>
                            <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
                                <h4 className="font-bold text-neutral-200 text-sm mb-2 flex items-center gap-2 border-b border-neutral-800 pb-1">
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                    Recycle Bin
                                </h4>
                                <p className="text-xs text-neutral-500 leading-relaxed">
                                    Deleted a group by mistake? Scroll to the bottom of the section to find the <strong>Recycle Bin</strong>. You can restore anything you removed during your session.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CHAPTER 4: CATALOGS MANAGER */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Star className="w-6 h-6 text-blue-500" />
                        4. Catalogs Manager (Global Lists)
                    </h2>
                    <div className="bg-neutral-900/50 p-5 rounded-2xl border border-neutral-800 space-y-4">
                        <div className="flex gap-4">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-600/30">
                                <Layout className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-neutral-100 text-sm">Global Catalogs</h4>
                                <p className="text-xs text-neutral-400 leading-relaxed">
                                    These appear below your custom groups on the Home Screen. You can toggle them <strong>On/Off</strong>, set them to <strong>Landscape</strong> (wide posters) or <strong>Small</strong> (compact view).
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-yellow-600/20 flex items-center justify-center border border-yellow-600/30">
                                <Hash className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-neutral-100 text-sm">Top Row Feature</h4>
                                <p className="text-xs text-neutral-400 leading-relaxed">
                                    Shows numbered items directly below "Continue Watching". You can specify the <strong>Item Count</strong> (how many items to show) and even hide the main row while keeping the Top Row active.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CHAPTER 5: GENERAL SETTINGS */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Settings className="w-6 h-6 text-blue-500" />
                        5. General Settings
                    </h2>
                    <div className="space-y-3">
                        {[
                            { label: "Hide Spoilers", desc: "Blurs descriptions and images for new episodes to avoid spoilers." },
                            { label: "External Playback Prompt", desc: "Keep it on if you use external players or need Trakt tracking." },
                            { label: "MDBList Rating Icons", desc: "Shows professional movie ratings (IMDb, Rotten Tomatoes) in the UI." },
                            { label: "Preferred Language", desc: "Sets the default audio and subtitle language for your content." }
                        ].map((s, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-neutral-900/30 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors">
                                <div>
                                    <h5 className="text-sm font-bold text-neutral-200">{s.label}</h5>
                                    <p className="text-[11px] text-neutral-500">{s.desc}</p>
                                </div>
                                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CHAPTER 6: EXPORT & CLEANUP */}
                <section className="space-y-4 border-t border-neutral-800 pt-8">
                    <h2 className="text-xl font-bold text-green-400 flex items-center gap-2">
                        <Download className="w-6 h-6" />
                        6. Finalizing & Saving
                    </h2>
                    <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 space-y-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <FileJson className="w-20 h-20" />
                        </div>

                        <p className="text-sm text-neutral-300 leading-relaxed relative z-10">
                            Once you are happy with your changes, use one of the two export buttons in the sidebar:
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                            <div className="flex-1 space-y-2">
                                <div className="p-3 bg-blue-600 rounded text-center font-bold text-sm shadow-lg shadow-blue-900/20">Download JSON</div>
                                <p className="text-[10px] text-neutral-500 text-center">Downloads the file to your computer.</p>
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="p-3 bg-neutral-800 border border-neutral-700 rounded text-center font-bold text-sm">Copy to Clipboard</div>
                                <p className="text-[10px] text-neutral-500 text-center">Ready to paste directly into your app settings.</p>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-green-950/20 border border-green-900/30 rounded-xl flex gap-3">
                            <HelpCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                            <div>
                                <h5 className="text-xs font-bold text-green-300 mb-1">Automatic Cleanup</h5>
                                <p className="text-[11px] text-neutral-400 leading-relaxed">
                                    The tool automatically removes unused data, fixes broken links, and validates your JSON structure **every time you export**. You don't need to do any manual cleanup!
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="text-center pt-8 border-t border-neutral-800">
                    <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest bg-neutral-900 inline-block px-4 py-1 rounded-full border border-neutral-800">
                        Omni Snapshot Manager v0.1.0 • by Bot-Bid-Raiser
                    </p>
                </footer>
            </div>
        </DialogContent>
    );
}
