import React, { useState } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";
import { Checkbox } from "../ui/checkbox";
import { ImageIcon, Search } from 'lucide-react';
import { CATALOG_FALLBACKS } from '@/lib/catalog-fallbacks';
import { cn, formatDisplayName, resolveCatalogName, ensureCatalogPrefix } from '@/lib/utils';
import { editorAction, editorLayout, editorSurface } from "./ui/style-contract";

type ThumbnailAspect = "portrait" | "landscape" | "square";

export function CreateGroupModal({ isOpen, onClose, initialParentUUID }: { isOpen: boolean, onClose: () => void, initialParentUUID?: string }) {
    const { currentValues, addMainCatalogGroup, addCatalogGroup, catalogs, customFallbacks } = useConfig();
    const [activeTab, setActiveTab] = useState("sub");

    // Main Group State
    const [mainName, setMainName] = useState("");
    const [selectedSubgroups, setSelectedSubgroups] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");

    // Subgroup State
    const [subName, setSubName] = useState("");
    const [subImageUrl, setSubImageUrl] = useState("");
    const [subImageAspect, setSubImageAspect] = useState<ThumbnailAspect>("square");
    const [subImageLoadError, setSubImageLoadError] = useState(false);
    const [targetMainGroup, setTargetMainGroup] = useState(initialParentUUID || "none");
    const [selectedCatalogs, setSelectedCatalogs] = useState<Set<string>>(new Set());
    const [catalogSearch, setCatalogSearch] = useState("");

    // Sync targetMainGroup when initialParentUUID changes or modal opens
    React.useEffect(() => {
        if (isOpen && initialParentUUID) {
            setTargetMainGroup(initialParentUUID);
            setActiveTab("sub"); // Ensure we are on the subgroup tab if a parent is provided
        }
    }, [isOpen, initialParentUUID]);

    React.useEffect(() => {
        setSubImageAspect("square");
        setSubImageLoadError(false);
    }, [subImageUrl]);

    // Lookups
    const catalogGroups = currentValues.catalog_groups || {};
    const allSubgroupNames = Object.keys(catalogGroups).sort();

    const mainCatalogGroups = currentValues.main_catalog_groups || {};
    const mainGroupOrder = currentValues.main_group_order || [];

    const customNames: Record<string, string> = React.useMemo(() => currentValues["custom_catalog_names"] || {}, [currentValues]);

    const catalogOptions = React.useMemo(() => {
        const options: { id: string, name: string }[] = [];

        // 1. All existing catalogs
        const existingBaseIds = new Set<string>();
        for (const c of catalogs) {
            existingBaseIds.add(c.id.replace(/^(movie:|series:)/, ''));
            options.push({
                id: c.id,
                name: resolveCatalogName(c.id, customNames) || c.name || c.id
            });
        }

        // 2. Fallbacks
        const allFallbacks = { ...CATALOG_FALLBACKS, ...customFallbacks };
        Object.entries(allFallbacks).forEach(([id, name]) => {
            if (!existingBaseIds.has(id.replace(/^(movie:|series:)/, ''))) {
                const displayName = customNames[id] || name;
                const finalId = ensureCatalogPrefix(id, displayName);
                options.push({
                    id: finalId,
                    name: displayName
                });
            }
        });

        // Sort
        return options.sort((a, b) => a.name.localeCompare(b.name));
    }, [catalogs, customFallbacks, customNames]);

    const filteredCatalogs = React.useMemo(() => {
        if (!catalogSearch) return catalogOptions;
        const q = catalogSearch.toLowerCase();
        return catalogOptions.filter(c =>
            c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
        );
    }, [catalogOptions, catalogSearch]);

    const resetState = () => {
        setMainName("");
        setSelectedSubgroups(new Set());
        setSearchQuery("");
        setSubName("");
        setSubImageUrl("");
        setTargetMainGroup("none");
        setSelectedCatalogs(new Set());
        setCatalogSearch("");
        setActiveTab("sub");
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleCreateMain = () => {
        if (!mainName.trim()) return;
        addMainCatalogGroup(mainName.trim(), Array.from(selectedSubgroups));
        handleClose();
    };

    const handleCreateSub = () => {
        if (!subName.trim()) return;
        addCatalogGroup(subName.trim(), targetMainGroup === 'none' ? "" : targetMainGroup, subImageUrl.trim(), Array.from(selectedCatalogs));
        handleClose();
    };

    const isSubImagePreviewable = /^https?:\/\//i.test(subImageUrl.trim());
    const subImageFrameClass = subImageAspect === "landscape"
        ? "h-10 w-16"
        : subImageAspect === "portrait"
            ? "h-11 w-8"
            : "h-10 w-10";

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className={cn(editorLayout.dialogContent, "sm:max-w-[425px] md:max-w-3xl sm:max-h-[95dvh]")}>
                <DialogHeader className="shrink-0">
                    <DialogTitle>Create New Group</DialogTitle>
                    <DialogDescription className="text-foreground/70">
                        Add a new group to your configuration.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-1 min-h-0 overflow-hidden">
                    <TabsList className={cn(editorSurface.toolbar, "grid w-full grid-cols-2 p-1 h-11 rounded-xl mb-4 shrink-0")}>
                        <TabsTrigger
                            value="sub"
                            className="rounded-lg border border-transparent text-foreground/70 data-[state=active]:border-primary/24 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm dark:data-[state=active]:border-primary/24 dark:data-[state=active]:bg-primary/18"
                        >
                            Subgroup
                        </TabsTrigger>
                        <TabsTrigger
                            value="main"
                            className="rounded-lg border border-transparent text-foreground/70 data-[state=active]:border-primary/24 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm dark:data-[state=active]:border-primary/24 dark:data-[state=active]:bg-primary/18"
                        >
                            Main Group
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="main" className="space-y-4 flex-1 flex flex-col min-h-0 data-[state=inactive]:hidden overflow-hidden">
                        <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="main-name" className="text-foreground">Name</Label>
                                <Input
                                    id="main-name"
                                    value={mainName}
                                    onChange={(e) => setMainName(e.target.value)}
                                    placeholder="e.g. User Collections"
                                    className={cn(editorSurface.field, "h-10 text-base sm:text-sm focus-visible:ring-ring/50")}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-foreground/80">Assign Existing Subgroups</Label>
                                <p className="text-xs text-foreground/50 mb-2">Select subgroups to move into this new Main Group.</p>

                                <div className="relative">
                                    <Search className="absolute left-2 top-2 h-4 w-4 text-foreground/70" />
                                    <Input
                                        placeholder="Search subgroups..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className={cn(editorSurface.field, "pl-8 h-10 sm:h-8 text-base sm:text-sm focus-visible:ring-ring/50 mb-2")}
                                    />
                                </div>

                                <ScrollArea className={cn(editorSurface.inset, editorSurface.listSurface, "h-[30vh] sm:h-[200px] rounded-xl px-4 pb-4")}>
                                    {allSubgroupNames.length === 0 ? (
                                        <p className="text-sm text-foreground/70 italic">No subgroups available.</p>
                                    ) : (
                                        <div className="space-y-3 pr-3 pb-2 pt-4">
                                            {allSubgroupNames
                                                .filter(name => name.toLowerCase().includes(searchQuery.toLowerCase()))
                                                .map(name => (
                                                    <div key={name} className="flex items-center space-x-2 pl-1 py-1.5 rounded-sm hover:bg-primary/10 dark:hover:bg-primary/16 transition-colors">
                                                        <Checkbox
                                                            id={`sg-${name}`}
                                                            checked={selectedSubgroups.has(name)}
                                                            onCheckedChange={(checked) => {
                                                                const next = new Set(selectedSubgroups);
                                                                if (checked) next.add(name);
                                                                else next.delete(name);
                                                                setSelectedSubgroups(next);
                                                            }}
                                                            className="border-border data-[state=unchecked]:hover:border-primary/70 data-[state=unchecked]:hover:bg-primary/10 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                        />
                                                        <label
                                                            htmlFor={`sg-${name}`}
                                                            className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground cursor-pointer select-none"
                                                        >
                                                            {formatDisplayName(name)}
                                                        </label>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        </div>

                        <DialogFooter className="mt-4 border-t border-border/50 pt-3 pb-[max(0px,env(safe-area-inset-bottom))]">
                            <Button variant="outline" onClick={handleClose} className={cn(editorAction.secondary, editorSurface.field, "bg-white/42")}>Cancel</Button>
                            <Button onClick={handleCreateMain} disabled={!mainName.trim()} className={editorAction.primary}>Create Main Group</Button>
                        </DialogFooter>
                    </TabsContent>

                    <TabsContent value="sub" className="space-y-6 flex-1 flex flex-col min-h-0 data-[state=inactive]:hidden overflow-hidden">
                        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sub-name" className="text-foreground">Name</Label>
                                    <Input
                                        id="sub-name"
                                        value={subName}
                                        onChange={(e) => setSubName(e.target.value)}
                                        placeholder="e.g. Action Movies"
                                        className={cn(editorSurface.field, "h-10 text-base sm:text-sm focus-visible:ring-ring/50 font-bold")}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="target-main" className="text-foreground">Main Group</Label>
                                    <Select value={targetMainGroup} onValueChange={setTargetMainGroup}>
                                        <SelectTrigger className={cn("w-full h-10 text-base sm:text-sm text-foreground", editorSurface.field)}>
                                            <SelectValue placeholder="Select a Main Group" />
                                        </SelectTrigger>
                                        <SelectContent className={cn(editorSurface.overlay, "max-h-[200px]")}>
                                            {mainGroupOrder.length === 0 ? (
                                                <SelectItem value="none" className="focus:bg-accent focus:text-accent-foreground italic text-foreground/70">None (Unassigned)</SelectItem>
                                            ) : (
                                                <>
                                                    <SelectItem value="none" className="focus:bg-accent focus:text-accent-foreground italic text-foreground/70">
                                                        None (Unassigned)
                                                    </SelectItem>
                                                    {mainGroupOrder.map((uuid: string) => (
                                                        <SelectItem key={uuid} value={uuid} className="focus:bg-accent focus:text-accent-foreground">
                                                            {formatDisplayName(mainCatalogGroups[uuid]?.name || "Unnamed")}
                                                        </SelectItem>
                                                    ))}
                                                </>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sub-image" className="text-foreground">Thumbnail Image URL (Optional)</Label>
                                    <div className={cn(editorSurface.panel, "flex items-center gap-3 p-2 rounded-xl")}>
                                        <div className={cn(editorSurface.inset, subImageFrameClass, "rounded-lg overflow-hidden shrink-0 flex items-center justify-center transition-[width,height] duration-200")}>
                                            {isSubImagePreviewable && !subImageLoadError ? (
                                                <>
                                                    {/* eslint-disable-next-line @next/next/no-img-element -- User-provided preview image URL for subgroup thumbnail. */}
                                                    <img
                                                        src={subImageUrl}
                                                        alt="Preview"
                                                        className="h-full w-full object-contain"
                                                        onLoad={(e) => {
                                                            const { naturalWidth, naturalHeight } = e.currentTarget;
                                                            if (!naturalWidth || !naturalHeight) {
                                                                setSubImageAspect("square");
                                                                return;
                                                            }
                                                            const ratio = naturalWidth / naturalHeight;
                                                            if (ratio > 1.2) setSubImageAspect("landscape");
                                                            else if (ratio < 0.82) setSubImageAspect("portrait");
                                                            else setSubImageAspect("square");
                                                        }}
                                                        onError={() => {
                                                            setSubImageLoadError(true);
                                                        }}
                                                    />
                                                </>
                                            ) : (
                                                <ImageIcon className="w-4 h-4 text-foreground/70" />
                                            )}
                                        </div>
                                        <Input
                                            id="sub-image"
                                            value={subImageUrl}
                                            onChange={(e) => setSubImageUrl(e.target.value)}
                                            placeholder="https://..."
                                            className={cn(editorSurface.field, "h-10 min-w-0 flex-1 px-3 text-base sm:text-sm font-medium focus-visible:ring-[3px] focus-visible:ring-ring/50")}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 flex flex-col">
                                <Label className="text-foreground/80">Assign Catalogs</Label>
                                <p className="text-xs text-foreground/50 mb-2">Select catalogs to populate this group.</p>

                                <div className="relative">
                                    <Search className="absolute left-2 top-2 h-4 w-4 text-foreground/70" />
                                    <Input
                                        placeholder="Search catalogs by name or ID..."
                                        value={catalogSearch}
                                        onChange={e => setCatalogSearch(e.target.value)}
                                        className={cn(editorSurface.field, "pl-8 h-10 sm:h-8 text-base sm:text-sm focus-visible:ring-ring/50 mb-2 focus:ring-0")}
                                    />
                                </div>

                                <ScrollArea className={cn(editorSurface.inset, editorSurface.listSurface, "h-[40vh] min-h-[320px] sm:h-[300px] md:h-[450px] rounded-xl px-4 pb-4")}>
                                    {filteredCatalogs.length === 0 ? (
                                        <p className="text-sm text-foreground/70 italic">No catalogs found.</p>
                                    ) : (
                                        <div className="space-y-4 pb-2 pt-4">
                                            {(() => {
                                                const groups: Record<string, typeof filteredCatalogs> = {
                                                    "Other": []
                                                };
                                                filteredCatalogs.forEach(cat => {
                                                    const match = cat.name.match(/^\[(.*?)\]\s*(.*)$/);
                                                    if (match) {
                                                        const category = match[1];
                                                        const cleanName = match[2];
                                                        if (!groups[category]) groups[category] = [];
                                                        groups[category].push({ ...cat, name: cleanName });
                                                    } else {
                                                        groups["Other"].push(cat);
                                                    }
                                                });

                                                // Render categories alphabetically, with Other at the top or bottom depending on preference. Let's put Other last.
                                                const sortedCategories = Object.keys(groups)
                                                    .filter(k => k !== "Other")
                                                    .sort((a, b) => a.localeCompare(b));

                                                if (groups["Other"].length > 0) {
                                                    sortedCategories.push("Other");
                                                }

                                                return sortedCategories.map(category => (
                                                    <div key={category} className="space-y-2">
                                                        <div className={cn(editorSurface.insetSticky, "sticky top-0 py-2.5 z-[60] mb-2 ml-[-1rem] w-[calc(100%+2rem)] px-4")}>
                                                            <h5 className="text-xs font-bold text-foreground/50 uppercase tracking-[0.2em]">{category}</h5>
                                                        </div>
                                                        <div className="space-y-3 pt-1">
                                                            {groups[category].map(cat => (
                                                                <div key={cat.id} className="flex items-start space-x-2 pl-1 py-1.5 rounded-sm hover:bg-primary/10 dark:hover:bg-primary/16 transition-colors">
                                                                    <Checkbox
                                                                        id={`cat-${cat.id}`}
                                                                        checked={selectedCatalogs.has(cat.id)}
                                                                        onCheckedChange={(checked) => {
                                                                            const next = new Set(selectedCatalogs);
                                                                            if (checked) next.add(cat.id);
                                                                            else next.delete(cat.id);
                                                                            setSelectedCatalogs(next);
                                                                        }}
                                                                        className="mt-0.5 border-border data-[state=unchecked]:hover:border-primary/70 data-[state=unchecked]:hover:bg-primary/10 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                                    />
                                                                    <label
                                                                        htmlFor={`cat-${cat.id}`}
                                                                        className="flex-1 text-sm font-medium leading-none text-foreground cursor-pointer select-none"
                                                                    >
                                                                        <div>{cat.name}</div>
                                                                        <div className="text-xs text-foreground/70 font-mono mt-1 w-full max-w-[300px] break-all">{cat.id}</div>
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        </div>
                        </div>

                        <DialogFooter className="mt-4 border-t border-border/50 pt-3 pb-[max(0px,env(safe-area-inset-bottom))]">
                            <Button variant="outline" onClick={handleClose} className={cn(editorAction.secondary, editorSurface.field, "bg-white/42")}>Cancel</Button>
                            <Button onClick={handleCreateSub} disabled={!subName.trim()} className={editorAction.primary}>Create Subgroup</Button>
                        </DialogFooter>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
