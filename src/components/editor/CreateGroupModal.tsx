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
import { formatDisplayName, resolveCatalogName, ensureCatalogPrefix } from '@/lib/utils';

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

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[425px] md:max-w-3xl bg-neutral-900 border-neutral-800 text-neutral-100 max-h-[95vh] overflow-y-auto w-[95vw] md:w-full flex-col">
                <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                    <DialogDescription className="text-neutral-400">
                        Add a new structural group to your configuration.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-neutral-950 p-1 rounded-md mb-4">
                        <TabsTrigger value="sub" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-400">Subgroup</TabsTrigger>
                        <TabsTrigger value="main" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-400">Main Group</TabsTrigger>
                    </TabsList>

                    <TabsContent value="main" className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="main-name" className="text-neutral-300">Name</Label>
                            <Input
                                id="main-name"
                                value={mainName}
                                onChange={(e) => setMainName(e.target.value)}
                                placeholder="e.g. User Collections"
                                className="bg-neutral-950 border-neutral-700 focus-visible:ring-blue-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-neutral-300">Assign Existing Subgroups</Label>
                            <p className="text-xs text-neutral-500 mb-2">Select subgroups to immediately move into this new Main Group.</p>

                            <div className="relative">
                                <Search className="absolute left-2 top-2 h-4 w-4 text-neutral-500" />
                                <Input
                                    placeholder="Search subgroups..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="pl-8 h-8 text-xs bg-neutral-950 border-neutral-700 focus-visible:ring-blue-500 mb-2"
                                />
                            </div>

                            <ScrollArea className="h-[200px] rounded-md border border-neutral-800 bg-neutral-950/50 p-4">
                                {allSubgroupNames.length === 0 ? (
                                    <p className="text-sm text-neutral-500 italic">No subgroups available.</p>
                                ) : (
                                    <div className="space-y-3 pr-3 pb-2 pt-1">
                                        {allSubgroupNames
                                            .filter(name => name.toLowerCase().includes(searchQuery.toLowerCase()))
                                            .map(name => (
                                                <div key={name} className="flex items-center space-x-2 pl-1">
                                                    <Checkbox
                                                        id={`sg-${name}`}
                                                        checked={selectedSubgroups.has(name)}
                                                        onCheckedChange={(checked) => {
                                                            const next = new Set(selectedSubgroups);
                                                            if (checked) next.add(name);
                                                            else next.delete(name);
                                                            setSelectedSubgroups(next);
                                                        }}
                                                        className="border-neutral-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                    />
                                                    <label
                                                        htmlFor={`sg-${name}`}
                                                        className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-neutral-300 cursor-pointer select-none"
                                                    >
                                                        {formatDisplayName(name)}
                                                    </label>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>

                        <DialogFooter className="mt-6">
                            <Button variant="outline" onClick={handleClose} className="bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white">Cancel</Button>
                            <Button onClick={handleCreateMain} disabled={!mainName.trim()} className="bg-blue-600 text-white hover:bg-blue-700">Create Main Group</Button>
                        </DialogFooter>
                    </TabsContent>

                    <TabsContent value="sub" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sub-name" className="text-neutral-300">Name</Label>
                                    <Input
                                        id="sub-name"
                                        value={subName}
                                        onChange={(e) => setSubName(e.target.value)}
                                        placeholder="e.g. Action Movies"
                                        className="bg-neutral-950 border-neutral-700 focus-visible:ring-blue-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="target-main" className="text-neutral-300">Parent Main Group</Label>
                                    <Select value={targetMainGroup} onValueChange={setTargetMainGroup}>
                                        <SelectTrigger className="w-full bg-neutral-950 border-neutral-700 text-neutral-200">
                                            <SelectValue placeholder="Select a Main Group" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-neutral-900 border-neutral-800 text-neutral-200 max-h-[200px]">
                                            {mainGroupOrder.length === 0 ? (
                                                <SelectItem value="none" className="focus:bg-neutral-800 focus:text-white italic text-neutral-400">None (Unassigned)</SelectItem>
                                            ) : (
                                                <>
                                                    <SelectItem value="none" className="focus:bg-neutral-800 focus:text-white italic text-neutral-400">
                                                        None (Unassigned)
                                                    </SelectItem>
                                                    {mainGroupOrder.map((uuid: string) => (
                                                        <SelectItem key={uuid} value={uuid} className="focus:bg-neutral-800 focus:text-white">
                                                            {formatDisplayName(mainCatalogGroups[uuid]?.name || "Unnamed")}
                                                        </SelectItem>
                                                    ))}
                                                </>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sub-image" className="text-neutral-300">Thumbnail Image URL (Optional)</Label>
                                    <div className="flex items-center gap-3 bg-neutral-950 border border-neutral-700 p-2 rounded-md">
                                        {subImageUrl && subImageUrl.startsWith("http") ? (
                                            <div className="h-10 w-10 rounded shadow-sm overflow-hidden bg-neutral-900 border border-neutral-800 shrink-0">
                                                <img
                                                    src={subImageUrl}
                                                    alt="Preview"
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="h-full w-full flex items-center justify-center text-neutral-600"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>';
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-10 w-10 rounded bg-neutral-900 border border-neutral-800 shrink-0 flex items-center justify-center">
                                                <ImageIcon className="w-4 h-4 text-neutral-600" />
                                            </div>
                                        )}
                                        <Input
                                            id="sub-image"
                                            value={subImageUrl}
                                            onChange={(e) => setSubImageUrl(e.target.value)}
                                            placeholder="https://..."
                                            className="border-0 bg-transparent focus-visible:ring-0 px-1 py-0 h-auto"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 flex flex-col">
                                <Label className="text-neutral-300">Assign Initial Catalogs</Label>
                                <p className="text-xs text-neutral-500 mb-2">Select catalogs to populate this group initially.</p>

                                <div className="relative">
                                    <Search className="absolute left-2 top-2 h-4 w-4 text-neutral-500" />
                                    <Input
                                        placeholder="Search catalogs by name or ID..."
                                        value={catalogSearch}
                                        onChange={e => setCatalogSearch(e.target.value)}
                                        className="pl-8 h-8 text-xs bg-neutral-950 border-neutral-700 focus-visible:ring-blue-500 mb-2"
                                    />
                                </div>

                                <ScrollArea className="h-[300px] md:h-[450px] rounded-md border border-neutral-800 bg-neutral-950/50 p-4">
                                    {filteredCatalogs.length === 0 ? (
                                        <p className="text-sm text-neutral-500 italic">No catalogs found.</p>
                                    ) : (
                                        <div className="space-y-4 pr-3 pb-2 pt-1">
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
                                                        <h5 className="text-xs font-semibold text-blue-400 uppercase tracking-wider sticky top-0 bg-neutral-950/90 py-1 backdrop-blur-sm z-10 border-b border-neutral-800/50">
                                                            {category}
                                                        </h5>
                                                        <div className="space-y-3 pt-1">
                                                            {groups[category].map(cat => (
                                                                <div key={cat.id} className="flex items-start space-x-2 pl-1">
                                                                    <Checkbox
                                                                        id={`cat-${cat.id}`}
                                                                        checked={selectedCatalogs.has(cat.id)}
                                                                        onCheckedChange={(checked) => {
                                                                            const next = new Set(selectedCatalogs);
                                                                            if (checked) next.add(cat.id);
                                                                            else next.delete(cat.id);
                                                                            setSelectedCatalogs(next);
                                                                        }}
                                                                        className="mt-0.5 border-neutral-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                                    />
                                                                    <label
                                                                        htmlFor={`cat-${cat.id}`}
                                                                        className="flex-1 text-sm font-medium leading-none text-neutral-300 cursor-pointer select-none"
                                                                    >
                                                                        <div>{cat.name}</div>
                                                                        <div className="text-[9px] text-neutral-500 font-mono mt-1 w-full max-w-[300px] break-all">{cat.id}</div>
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

                        <DialogFooter className="mt-6">
                            <Button variant="outline" onClick={handleClose} className="bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white">Cancel</Button>
                            <Button onClick={handleCreateSub} disabled={!subName.trim()} className="bg-blue-600 text-white hover:bg-blue-700">Create Subgroup</Button>
                        </DialogFooter>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
