module.exports = [
"[project]/src/components/editor/ImportSetupModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ImportSetupModal",
    ()=>ImportSetupModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/dialog.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ConfigContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/ConfigContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$upload$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UploadCloud$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/cloud-upload.js [app-ssr] (ecmascript) <export default as UploadCloud>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-ssr] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$braces$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileJson$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-braces.js [app-ssr] (ecmascript) <export default as FileJson>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-ssr] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/tabs.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$checkbox$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/checkbox.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$scroll$2d$area$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/scroll-area.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/config-utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/dropdown-menu.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/badge.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
const isPlaceholderSg = (name, catalogs)=>{
    const cats = Array.isArray(catalogs) ? catalogs : [];
    if (cats.length > 0) return false;
    const placeholders = [
        "[Decades]",
        "[Actors]",
        "[Awards]",
        "[Discover]",
        "[Collections]",
        "[Streaming Services]",
        "[Directors]",
        "[Genres]"
    ];
    return placeholders.some((p)=>name.includes(p));
};
const getSubgroupCategory = (name)=>{
    if (name.includes("[Actors]")) return "Actors";
    if (name.includes("[Directors]")) return "Directors";
    if (name.includes("[Genres]")) return "Genres";
    if (name.includes("[Decades]")) return "Decades";
    if (name.includes("[Awards]")) return "Awards";
    if (name.includes("[Discover]")) return "Discover";
    if (name.includes("[Collections]")) return "Collections";
    if (name.includes("[Streaming Services]")) return "Streaming Services";
    return "Other";
};
function ImportSetupModal({ isOpen, onClose }) {
    const { currentValues, importGroups } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ConfigContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useConfig"])();
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const templates = [
        {
            label: "v1.7.1",
            url: "https://raw.githubusercontent.com/nobnobz/Omni-Template-Bot-Bid-Raiser/refs/heads/main/Older%20Versions/v1.7.1/omni-snapshot-unified-media-experience-v1.7.1-2026-03-02.json"
        }
    ];
    const [selectedVersion, setSelectedVersion] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(templates[0].label);
    const [templateLoading, setTemplateLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(1);
    const [fileName, setFileName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    // State for all imported values (needed for metadata extraction)
    const [importedValues, setImportedValues] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [selectedGlobalKeys, setSelectedGlobalKeys] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    // Parsed Data
    const [parsedMainGroups, setParsedMainGroups] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [parsedSubgroups, setParsedSubgroups] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    // Selections
    const [selectedMainGroupUuids, setSelectedMainGroupUuids] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [selectedStandaloneSubgroups, setSelectedStandaloneSubgroups] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    // assignments: subgroupName -> targetMainGroupUuid (from the CURRENT setup, not the parsed one)
    const [standaloneAssignments, setStandaloneAssignments] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const resetState = ()=>{
        setStep(1);
        setFileName("");
        setError("");
        setParsedMainGroups([]);
        setParsedSubgroups([]);
        setSelectedMainGroupUuids(new Set());
        setSelectedStandaloneSubgroups(new Set());
        setStandaloneAssignments({});
        setImportedValues({});
        setSelectedGlobalKeys(new Set());
        setTemplateLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };
    const handleClose = ()=>{
        resetState();
        onClose();
    };
    const processUploadedJson = (jsonString)=>{
        try {
            const rawData = JSON.parse(jsonString);
            let imported = {};
            // Check if it's an OmniConfig (with `.values`) or a raw decoded JSON
            if (rawData.values) {
                // Decode it like we do in ConfigContext
                for (const [key, val] of Object.entries(rawData.values)){
                    imported[key] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["decodeConfig"])(val);
                }
            } else if (rawData.main_catalog_groups || rawData.catalog_groups) {
                // Already raw decoded
                imported = rawData;
            } else {
                throw new Error("Invalid format. Could not find configuration data.");
            }
            setImportedValues(imported);
            // Current state for duplicate checking
            const currentMainGroupNames = new Set(Object.values(currentValues.main_catalog_groups || {}).map((g)=>g.name));
            const currentSubgroupNames = new Set(Object.keys(currentValues.catalog_groups || {}));
            // Parse Main Groups
            const inMainGroups = imported.main_catalog_groups || {};
            const inMainGroupOrder = imported.main_group_order || Object.keys(inMainGroups);
            const inCatalogsGroups = imported.catalog_groups || {};
            const parsedMGs = [];
            for (const uuid of inMainGroupOrder){
                const group = inMainGroups[uuid];
                if (!group) continue;
                parsedMGs.push({
                    originalUuid: uuid,
                    name: group.name || "Unnamed Group",
                    subgroupNames: (imported.subgroup_order?.[uuid] || group.subgroupNames || []).filter((sg)=>!isPlaceholderSg(sg, inCatalogsGroups[sg])),
                    posterType: group.posterType || "Poster",
                    posterSize: group.posterSize || "Default",
                    isDuplicate: currentMainGroupNames.has(group.name)
                });
            }
            // Create a mapping from subgroup name to its parent main group category
            const sgCategoryMap = {};
            parsedMGs.forEach((mg)=>{
                mg.subgroupNames.forEach((sgName)=>{
                    if (!sgCategoryMap[sgName]) {
                        sgCategoryMap[sgName] = mg.name;
                    }
                });
            });
            // Parse Subgroups
            const inImageUrls = imported.catalog_group_image_urls || {};
            const inCatalogGroupOrder = imported.catalog_group_order || Object.keys(inCatalogsGroups);
            const parsedSGs = [];
            for (const sgName of inCatalogGroupOrder){
                if (!inCatalogsGroups[sgName]) continue;
                if (isPlaceholderSg(sgName, inCatalogsGroups[sgName])) continue;
                const newImage = inImageUrls[sgName];
                const existingImage = currentValues.catalog_group_image_urls?.[sgName];
                const isDup = currentSubgroupNames.has(sgName);
                const parsedCats = Array.isArray(inCatalogsGroups[sgName]) ? inCatalogsGroups[sgName] : [];
                const existCats = currentValues.catalog_groups?.[sgName] || [];
                // Compare arrays for exact match to know if an update is actually needed
                const isCatsDiff = parsedCats.length !== existCats.length || parsedCats.some((c, i)=>c !== existCats[i]);
                const hasNewCats = isDup && isCatsDiff;
                parsedSGs.push({
                    name: sgName,
                    catalogs: parsedCats,
                    imageUrl: newImage,
                    isDuplicate: isDup,
                    hasNewImage: isDup && !!newImage && newImage !== existingImage,
                    hasNewCatalogs: hasNewCats,
                    category: sgCategoryMap[sgName] || getSubgroupCategory(sgName)
                });
            }
            const getSgWeight = (sg)=>sg.isDuplicate ? sg.hasNewCatalogs || sg.hasNewImage ? 1 : 2 : 0;
            parsedMGs.sort((a, b)=>Number(a.isDuplicate) - Number(b.isDuplicate));
            parsedSGs.sort((a, b)=>getSgWeight(a) - getSgWeight(b));
            setParsedMainGroups(parsedMGs);
            setParsedSubgroups(parsedSGs);
            setStep(2);
            setError("");
        } catch (err) {
            console.error("Parse error:", err);
            setError(err.message || "Failed to parse JSON file.");
        }
    };
    const handleFileUpload = (e)=>{
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event)=>{
            const content = event.target?.result;
            processUploadedJson(content);
        };
        reader.readAsText(file);
    };
    const handleImport = ()=>{
        const payloadMainGroups = {};
        const payloadSubgroups = {};
        const associatedMetadata = {};
        // 1. Mark which catalogs we're importing to fetch their metadata later
        const importedCatalogIds = new Set();
        // 2. Gather Selected Main Groups and their nested subgroups
        const subgroupsIncludedViaMainGroups = new Set();
        parsedMainGroups.forEach((mg)=>{
            if (selectedMainGroupUuids.has(mg.originalUuid)) {
                payloadMainGroups[mg.originalUuid] = {
                    name: mg.name,
                    subgroupNames: mg.subgroupNames,
                    posterType: mg.posterType,
                    posterSize: mg.posterSize
                };
                mg.subgroupNames.forEach((sgName)=>{
                    subgroupsIncludedViaMainGroups.add(sgName);
                    // Add the actual subgroup data to payload
                    const parsedSg = parsedSubgroups.find((s)=>s.name === sgName);
                    if (parsedSg) {
                        payloadSubgroups[sgName] = {
                            catalogs: parsedSg.catalogs,
                            imageUrl: parsedSg.imageUrl
                        };
                        parsedSg.catalogs.forEach((cId)=>importedCatalogIds.add(cId));
                    }
                });
            }
        });
        // 3. Gather Standalone Subgroups
        parsedSubgroups.forEach((sg)=>{
            if (selectedStandaloneSubgroups.has(sg.name) && !subgroupsIncludedViaMainGroups.has(sg.name)) {
                payloadSubgroups[sg.name] = {
                    catalogs: sg.catalogs,
                    imageUrl: sg.imageUrl
                };
                sg.catalogs.forEach((cId)=>importedCatalogIds.add(cId));
            }
        });
        // 4. Capture Associated Metadata (Custom Names, Images, Patterns)
        if (importedCatalogIds.size > 0) {
            associatedMetadata.custom_catalog_names = {};
            associatedMetadata.regex_pattern_image_urls = {};
            associatedMetadata.enabled_patterns = new Set();
            const inCustomNames = importedValues.custom_catalog_names || {};
            const inImageUrls = importedValues.regex_pattern_image_urls || {};
            const inAutoPlay = importedValues.auto_play_enabled_patterns || [];
            const inTagEnabled = importedValues.pattern_tag_enabled_patterns || [];
            importedCatalogIds.forEach((id)=>{
                if (inCustomNames[id]) associatedMetadata.custom_catalog_names[id] = inCustomNames[id];
                if (inImageUrls[id]) associatedMetadata.regex_pattern_image_urls[id] = inImageUrls[id];
                // Regex patterns usually target catalog IDs either directly or via substring in their rules
                // But for simplicity and safety, we also look for patterns named like the catalogs
                // and check the enabled lists
                if (inAutoPlay.includes(id)) associatedMetadata.enabled_patterns.add(id);
                if (inTagEnabled.includes(id)) associatedMetadata.enabled_patterns.add(id);
            });
            // Convert set to array for payload
            associatedMetadata.enabled_patterns = Array.from(associatedMetadata.enabled_patterns);
        }
        // 5. Global Settings
        const globalSettings = {};
        selectedGlobalKeys.forEach((key)=>{
            if (importedValues[key] !== undefined) {
                globalSettings[key] = importedValues[key];
            }
        });
        importGroups({
            mainGroups: payloadMainGroups,
            subgroups: payloadSubgroups,
            standaloneAssignments: standaloneAssignments,
            metadata: associatedMetadata,
            globalSettings: globalSettings
        });
        handleClose();
    };
    // Toggle Main Group Selection
    const toggleMainGroup = (uuid, isDuplicate)=>{
        if (isDuplicate) return;
        const next = new Set(selectedMainGroupUuids);
        const isNowSelected = !next.has(uuid);
        if (!isNowSelected) {
            next.delete(uuid);
        } else {
            next.add(uuid);
        }
        setSelectedMainGroupUuids(next);
        // Auto-select linked subgroups
        const mg = parsedMainGroups.find((m)=>m.originalUuid === uuid);
        if (mg) {
            const nextStandalone = new Set(selectedStandaloneSubgroups);
            mg.subgroupNames.forEach((sgName)=>{
                const sg = parsedSubgroups.find((s)=>s.name === sgName);
                if (sg && !sg.isDuplicate) {
                    if (isNowSelected) nextStandalone.add(sgName);
                    else nextStandalone.delete(sgName);
                }
            });
            setSelectedStandaloneSubgroups(nextStandalone);
        }
    };
    // Toggle Standalone Subgroup Selection
    const toggleSubgroup = (name, isDuplicate)=>{
        if (isDuplicate) return;
        const next = new Set(selectedStandaloneSubgroups);
        if (next.has(name)) {
            next.delete(name);
        } else {
            next.add(name);
        }
        setSelectedStandaloneSubgroups(next);
    };
    // Bulk Actions Main Groups
    const selectAllMain = ()=>{
        const next = new Set();
        parsedMainGroups.forEach((mg)=>{
            if (!mg.isDuplicate) next.add(mg.originalUuid);
        });
        setSelectedMainGroupUuids(next);
    };
    const deselectAllMain = ()=>{
        setSelectedMainGroupUuids(new Set());
    };
    // Bulk Actions Subgroups
    const selectAllSubgroups = ()=>{
        const next = new Set();
        parsedSubgroups.forEach((sg)=>{
            const isFullyExisting = sg.isDuplicate && !sg.hasNewCatalogs && !sg.hasNewImage;
            const includedInMain = parsedMainGroups.some((mg)=>selectedMainGroupUuids.has(mg.originalUuid) && mg.subgroupNames.includes(sg.name));
            if (!isFullyExisting && !includedInMain) {
                next.add(sg.name);
            }
        });
        setSelectedStandaloneSubgroups(next);
    };
    const deselectAllSubgroups = ()=>{
        setSelectedStandaloneSubgroups(new Set());
    };
    const selectCatalogUpdates = ()=>{
        const next = new Set();
        parsedSubgroups.forEach((sg)=>{
            const includedInMain = parsedMainGroups.some((mg)=>selectedMainGroupUuids.has(mg.originalUuid) && mg.subgroupNames.includes(sg.name));
            if (sg.isDuplicate && sg.hasNewCatalogs && !includedInMain) {
                next.add(sg.name);
            }
        });
        setSelectedStandaloneSubgroups(next);
    };
    const selectImageUpdates = ()=>{
        const next = new Set();
        parsedSubgroups.forEach((sg)=>{
            const includedInMain = parsedMainGroups.some((mg)=>selectedMainGroupUuids.has(mg.originalUuid) && mg.subgroupNames.includes(sg.name));
            if (sg.isDuplicate && sg.hasNewImage && !includedInMain) {
                next.add(sg.name);
            }
        });
        setSelectedStandaloneSubgroups(next);
    };
    const currentMainGroups = currentValues.main_catalog_groups || {};
    const currentMainGroupOrder = currentValues.main_group_order || [];
    const totalSelectedToImport = selectedMainGroupUuids.size + selectedStandaloneSubgroups.size;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Dialog"], {
        open: isOpen,
        onOpenChange: (open)=>!open && handleClose(),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DialogContent"], {
            className: "sm:max-w-2xl bg-neutral-950 border-neutral-800 text-neutral-200",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DialogHeader"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DialogTitle"], {
                            children: "Add From Existing Setup"
                        }, void 0, false, {
                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                            lineNumber: 432,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DialogDescription"], {
                            className: "text-neutral-400",
                            children: step === 1 ? "Upload a valid .json configuration to extract groups." : `Review and select groups from ${fileName}`
                        }, void 0, false, {
                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                            lineNumber: 433,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                    lineNumber: 431,
                    columnNumber: 17
                }, this),
                step === 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-5 border border-neutral-800 rounded-lg bg-neutral-900/50",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "font-semibold text-sm text-neutral-200 mb-3",
                                    children: "Load Unified Media Experience Template"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                    lineNumber: 442,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            value: selectedVersion,
                                            onChange: (e)=>setSelectedVersion(e.target.value),
                                            className: "flex-1 h-10 rounded-md border border-neutral-800 bg-neutral-950/50 px-3 text-xs text-neutral-100 font-mono transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer",
                                            children: templates.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: t.label,
                                                    children: t.label
                                                }, t.label, false, {
                                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                    lineNumber: 450,
                                                    columnNumber: 41
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                            lineNumber: 444,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                            onClick: async ()=>{
                                                const t = templates.find((t)=>t.label === selectedVersion);
                                                if (!t) return;
                                                setTemplateLoading(true);
                                                setError("");
                                                try {
                                                    const res = await fetch(t.url);
                                                    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
                                                    const buffer = await res.arrayBuffer();
                                                    const text = new TextDecoder("utf-8").decode(buffer);
                                                    setFileName(`Template ${t.label}`);
                                                    processUploadedJson(text);
                                                } catch (err) {
                                                    setError(err.message || "Failed to load template.");
                                                } finally{
                                                    setTemplateLoading(false);
                                                }
                                            },
                                            disabled: templateLoading,
                                            className: "bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 px-5",
                                            children: templateLoading ? "Loading..." : "Load"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                            lineNumber: 453,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                    lineNumber: 443,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                            lineNumber: 441,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 h-px bg-neutral-800"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                    lineNumber: 481,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[10px] text-neutral-600 uppercase font-bold tracking-wider",
                                    children: "or upload file"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                    lineNumber: 482,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 h-px bg-neutral-800"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                    lineNumber: 483,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                            lineNumber: 480,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col items-center justify-center p-8 border-2 border-dashed border-neutral-800 rounded-lg hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$upload$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UploadCloud$3e$__["UploadCloud"], {
                                    className: "w-10 h-10 text-neutral-500 mb-3"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                    lineNumber: 488,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "font-medium text-sm text-neutral-300 mb-1",
                                    children: "Upload configuration file"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                    lineNumber: 489,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-neutral-500 mb-4 max-w-sm",
                                    children: [
                                        "Select an ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                            children: "omni-config.json"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                            lineNumber: 491,
                                            columnNumber: 43
                                        }, this),
                                        " file to import Main Groups and Subgroups."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                    lineNumber: 490,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                    onClick: ()=>fileInputRef.current?.click(),
                                    variant: "outline",
                                    className: "bg-neutral-900 border-neutral-700 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold",
                                    children: "Select File"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                    lineNumber: 493,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "file",
                                    accept: ".json",
                                    className: "hidden",
                                    ref: fileInputRef,
                                    onChange: handleFileUpload
                                }, void 0, false, {
                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                    lineNumber: 496,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                            lineNumber: 487,
                            columnNumber: 25
                        }, this),
                        error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                    className: "w-4 h-4 mr-2"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                    lineNumber: 507,
                                    columnNumber: 33
                                }, this),
                                error
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                            lineNumber: 506,
                            columnNumber: 29
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                    lineNumber: 439,
                    columnNumber: 21
                }, this),
                step === 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tabs"], {
                    defaultValue: "subgroups",
                    className: "w-full",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TabsList"], {
                            className: "grid w-full grid-cols-3 bg-neutral-900 border border-neutral-800",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                    value: "subgroups",
                                    className: "data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-xs",
                                    children: [
                                        "Subgroups (",
                                        parsedSubgroups.length,
                                        ")"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                    lineNumber: 517,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                    value: "main",
                                    className: "data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-xs",
                                    children: [
                                        "Main Groups (",
                                        parsedMainGroups.length,
                                        ")"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                    lineNumber: 520,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                    value: "settings",
                                    className: "data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-xs",
                                    children: "Settings"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                    lineNumber: 523,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                            lineNumber: 516,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-4 border border-neutral-800 rounded-md bg-neutral-950",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$scroll$2d$area$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ScrollArea"], {
                                className: "h-[40vh]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TabsContent"], {
                                        value: "main",
                                        className: "p-0 m-0",
                                        children: parsedMainGroups.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-8 text-center text-neutral-500 italic",
                                            children: "No Main Groups found in this file."
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                            lineNumber: 532,
                                            columnNumber: 41
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col divide-y divide-neutral-800/50",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "p-2 bg-neutral-900/50 border-b border-neutral-800 flex gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                            variant: "secondary",
                                                            size: "sm",
                                                            onClick: selectAllMain,
                                                            className: "h-7 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200",
                                                            children: "Select All New"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                            lineNumber: 536,
                                                            columnNumber: 49
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                            variant: "ghost",
                                                            size: "sm",
                                                            onClick: deselectAllMain,
                                                            className: "h-7 text-xs text-neutral-400 hover:text-white",
                                                            children: "Deselect All"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                            lineNumber: 537,
                                                            columnNumber: 49
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                    lineNumber: 535,
                                                    columnNumber: 45
                                                }, this),
                                                parsedMainGroups.map((mg)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `flex items-start p-4 transition-colors ${mg.isDuplicate ? 'opacity-50 bg-neutral-900/40 cursor-not-allowed' : 'hover:bg-neutral-900/50'}`,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$checkbox$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Checkbox"], {
                                                                id: `mg-${mg.originalUuid}`,
                                                                checked: selectedMainGroupUuids.has(mg.originalUuid) || mg.isDuplicate,
                                                                disabled: mg.isDuplicate,
                                                                onCheckedChange: ()=>toggleMainGroup(mg.originalUuid, mg.isDuplicate),
                                                                className: "mt-1"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                lineNumber: 544,
                                                                columnNumber: 53
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "ml-3 flex-1 min-w-0",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                        htmlFor: `mg-${mg.originalUuid}`,
                                                                        className: `font-semibold block ${mg.isDuplicate ? '' : 'cursor-pointer'}`,
                                                                        children: [
                                                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatDisplayName"])(mg.name),
                                                                            mg.isDuplicate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Badge"], {
                                                                                variant: "outline",
                                                                                className: "ml-2 bg-neutral-900 border-neutral-700 text-neutral-500 text-[9px] uppercase",
                                                                                children: "Exists"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                                lineNumber: 554,
                                                                                columnNumber: 80
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                        lineNumber: 552,
                                                                        columnNumber: 57
                                                                    }, this),
                                                                    mg.subgroupNames.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "mt-2 pl-3 border-l-2 border-neutral-800 space-y-1",
                                                                        children: mg.subgroupNames.map((sg)=>{
                                                                            const parsedSg = parsedSubgroups.find((p)=>p.name === sg);
                                                                            const isSgDup = parsedSg?.isDuplicate;
                                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex items-center text-xs text-neutral-400",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: `truncate ${isSgDup ? 'line-through opacity-70' : ''}`,
                                                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatDisplayName"])(sg)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                                        lineNumber: 564,
                                                                                        columnNumber: 77
                                                                                    }, this),
                                                                                    isSgDup && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "ml-2 text-[10px] text-neutral-600",
                                                                                        children: "(Will use existing)"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                                        lineNumber: 565,
                                                                                        columnNumber: 89
                                                                                    }, this)
                                                                                ]
                                                                            }, sg, true, {
                                                                                fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                                lineNumber: 563,
                                                                                columnNumber: 73
                                                                            }, this);
                                                                        })
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                        lineNumber: 558,
                                                                        columnNumber: 61
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                lineNumber: 551,
                                                                columnNumber: 53
                                                            }, this)
                                                        ]
                                                    }, mg.originalUuid, true, {
                                                        fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                        lineNumber: 540,
                                                        columnNumber: 49
                                                    }, this))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                            lineNumber: 534,
                                            columnNumber: 41
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                        lineNumber: 530,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TabsContent"], {
                                        value: "subgroups",
                                        className: "p-0 m-0",
                                        children: parsedSubgroups.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-8 text-center text-neutral-500 italic",
                                            children: "No Subgroups found in this file."
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                            lineNumber: 580,
                                            columnNumber: 41
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col divide-y divide-neutral-800/50",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "p-3 bg-blue-900/10 border-b border-neutral-800 text-xs text-blue-300 px-4",
                                                    children: [
                                                        "Select subgroups you want to import independent of Main Groups. You can assign them to your ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            children: "existing"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                            lineNumber: 584,
                                                            columnNumber: 141
                                                        }, this),
                                                        " main groups below."
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                    lineNumber: 583,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "p-2 bg-neutral-900/50 border-b border-neutral-800 flex flex-wrap gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                            variant: "secondary",
                                                            size: "sm",
                                                            onClick: selectAllSubgroups,
                                                            className: "h-7 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200",
                                                            children: "Select All"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                            lineNumber: 587,
                                                            columnNumber: 49
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                            variant: "secondary",
                                                            size: "sm",
                                                            onClick: selectCatalogUpdates,
                                                            className: "h-7 text-xs bg-amber-600/20 text-amber-500 hover:bg-amber-600/30 border border-amber-500/30",
                                                            children: "Update Catalogs"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                            lineNumber: 588,
                                                            columnNumber: 49
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                            variant: "secondary",
                                                            size: "sm",
                                                            onClick: selectImageUpdates,
                                                            className: "h-7 text-xs bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-500/30",
                                                            children: "Update Images"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                            lineNumber: 589,
                                                            columnNumber: 49
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                            variant: "ghost",
                                                            size: "sm",
                                                            onClick: deselectAllSubgroups,
                                                            className: "h-7 text-xs text-neutral-400 hover:text-white mb-1",
                                                            children: "Deselect All"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                            lineNumber: 590,
                                                            columnNumber: 49
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                    lineNumber: 586,
                                                    columnNumber: 45
                                                }, this),
                                                (()=>{
                                                    const newSgs = parsedSubgroups.filter((sg)=>!sg.isDuplicate);
                                                    const mergeSgs = parsedSubgroups.filter((sg)=>sg.isDuplicate && (sg.hasNewCatalogs || sg.hasNewImage));
                                                    const existingSgs = parsedSubgroups.filter((sg)=>sg.isDuplicate && !sg.hasNewCatalogs && !sg.hasNewImage);
                                                    const renderSubgroupRow = (sg)=>{
                                                        const isSelected = selectedStandaloneSubgroups.has(sg.name);
                                                        const includedInMain = parsedMainGroups.some((mg)=>selectedMainGroupUuids.has(mg.originalUuid) && mg.subgroupNames.includes(sg.name));
                                                        const isFullyExisting = sg.isDuplicate && !sg.hasNewCatalogs && !sg.hasNewImage;
                                                        const isDisabled = includedInMain || isFullyExisting;
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: `flex items-center p-4 transition-colors ${isDisabled ? 'opacity-50 bg-neutral-900/40' : 'hover:bg-neutral-900/50'}`,
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$checkbox$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Checkbox"], {
                                                                    id: `sg-${sg.name}`,
                                                                    checked: isSelected || includedInMain,
                                                                    disabled: isDisabled,
                                                                    onCheckedChange: ()=>toggleSubgroup(sg.name, isDisabled)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                    lineNumber: 608,
                                                                    columnNumber: 61
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "ml-3 flex-1 min-w-0 pr-4",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            htmlFor: `sg-${sg.name}`,
                                                                            className: `font-semibold text-sm block truncate ${isDisabled ? '' : 'cursor-pointer'}`,
                                                                            children: [
                                                                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatDisplayName"])(sg.name),
                                                                                sg.isDuplicate && sg.hasNewCatalogs && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Badge"], {
                                                                                    variant: "default",
                                                                                    className: "ml-2 bg-amber-600/20 text-amber-500 border border-amber-500/30 text-[9px] uppercase hover:bg-amber-600/30",
                                                                                    children: "Replace Catalogs"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                                    lineNumber: 617,
                                                                                    columnNumber: 109
                                                                                }, this),
                                                                                sg.isDuplicate && !sg.hasNewCatalogs && !sg.hasNewImage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Badge"], {
                                                                                    variant: "outline",
                                                                                    className: "ml-2 bg-neutral-900 border-neutral-700 text-neutral-500 text-[9px] uppercase",
                                                                                    children: "Existing"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                                    lineNumber: 618,
                                                                                    columnNumber: 129
                                                                                }, this),
                                                                                sg.hasNewImage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Badge"], {
                                                                                    variant: "default",
                                                                                    className: "ml-2 bg-purple-600/20 text-purple-400 border border-purple-500/30 text-[9px] uppercase hover:bg-purple-600/30",
                                                                                    children: "Update Image"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                                    lineNumber: 619,
                                                                                    columnNumber: 88
                                                                                }, this),
                                                                                includedInMain && !sg.isDuplicate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Badge"], {
                                                                                    className: "ml-2 bg-blue-900/40 text-blue-400 border-blue-900 text-[9px] uppercase",
                                                                                    children: "Included w/ Main"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                                    lineNumber: 620,
                                                                                    columnNumber: 107
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                            lineNumber: 615,
                                                                            columnNumber: 65
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "text-[10px] text-neutral-500 mt-0.5",
                                                                            children: [
                                                                                sg.catalogs.length,
                                                                                " ",
                                                                                sg.catalogs.length === 1 ? 'Catalog' : 'Catalogs'
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                            lineNumber: 622,
                                                                            columnNumber: 65
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                    lineNumber: 614,
                                                                    columnNumber: 61
                                                                }, this),
                                                                isSelected && !isDisabled && !sg.isDuplicate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DropdownMenu"], {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DropdownMenuTrigger"], {
                                                                            asChild: true,
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                                                variant: "outline",
                                                                                size: "sm",
                                                                                className: "h-7 text-xs bg-neutral-900 border-neutral-700 shrink-0 min-w-[140px] justify-between",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "truncate max-w-[100px]",
                                                                                        children: standaloneAssignments[sg.name] ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatDisplayName"])(currentMainGroups[standaloneAssignments[sg.name]]?.name || "Unassigned") : "Unassigned"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                                        lineNumber: 629,
                                                                                        columnNumber: 77
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                                                        className: "w-3 h-3 ml-2 opacity-50"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                                        lineNumber: 632,
                                                                                        columnNumber: 77
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                                lineNumber: 628,
                                                                                columnNumber: 73
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                            lineNumber: 627,
                                                                            columnNumber: 69
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DropdownMenuContent"], {
                                                                            className: "bg-neutral-900 border-neutral-800 text-neutral-200",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                                                                                    onClick: ()=>setStandaloneAssignments((prev)=>{
                                                                                            const n = {
                                                                                                ...prev
                                                                                            };
                                                                                            delete n[sg.name];
                                                                                            return n;
                                                                                        }),
                                                                                    className: "text-xs focus:bg-amber-500/20 focus:text-amber-400 font-semibold",
                                                                                    children: "None (Unassigned)"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                                    lineNumber: 636,
                                                                                    columnNumber: 73
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DropdownMenuLabel"], {
                                                                                    className: "text-[10px] uppercase text-neutral-500 font-bold mt-2",
                                                                                    children: "Assign to Current Match"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                                    lineNumber: 642,
                                                                                    columnNumber: 73
                                                                                }, this),
                                                                                currentMainGroupOrder.map((uuid)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                                                                                        onClick: ()=>setStandaloneAssignments((prev)=>({
                                                                                                    ...prev,
                                                                                                    [sg.name]: uuid
                                                                                                })),
                                                                                        className: "text-xs focus:bg-blue-500/20 focus:text-blue-400",
                                                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatDisplayName"])(currentMainGroups[uuid]?.name || "Unnamed")
                                                                                    }, uuid, false, {
                                                                                        fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                                        lineNumber: 644,
                                                                                        columnNumber: 77
                                                                                    }, this))
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                            lineNumber: 635,
                                                                            columnNumber: 69
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                    lineNumber: 626,
                                                                    columnNumber: 65
                                                                }, this)
                                                            ]
                                                        }, sg.name, true, {
                                                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                            lineNumber: 604,
                                                            columnNumber: 57
                                                        }, this);
                                                    };
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex flex-col",
                                                        children: [
                                                            mergeSgs.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "p-2 bg-neutral-900 font-semibold text-xs text-neutral-400 uppercase tracking-wider sticky top-0 z-10 border-b border-y-neutral-800",
                                                                        children: [
                                                                            "Updates (",
                                                                            mergeSgs.length,
                                                                            ")"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                        lineNumber: 663,
                                                                        columnNumber: 65
                                                                    }, this),
                                                                    mergeSgs.map(renderSubgroupRow)
                                                                ]
                                                            }, void 0, true),
                                                            newSgs.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "p-2 bg-neutral-900 font-semibold text-xs text-neutral-400 uppercase tracking-wider sticky top-0 z-10 border-y border-y-neutral-800",
                                                                        children: [
                                                                            "New Subgroups (",
                                                                            newSgs.length,
                                                                            ")"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                        lineNumber: 671,
                                                                        columnNumber: 65
                                                                    }, this),
                                                                    (()=>{
                                                                        // Get unique categories present in newSgs
                                                                        const presentCategories = Array.from(new Set(newSgs.map((sg)=>sg.category || "Other")));
                                                                        // Sort categories: predefined ones first, then others alphabetically
                                                                        const predefinedOrder = [
                                                                            "Actors",
                                                                            "Directors",
                                                                            "Genres",
                                                                            "Decades",
                                                                            "Awards",
                                                                            "Discover",
                                                                            "Collections",
                                                                            "Streaming Services",
                                                                            "Other"
                                                                        ];
                                                                        presentCategories.sort((a, b)=>{
                                                                            const idxA = predefinedOrder.indexOf(a);
                                                                            const idxB = predefinedOrder.indexOf(b);
                                                                            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                                                                            if (idxA !== -1) return -1;
                                                                            if (idxB !== -1) return 1;
                                                                            return a.localeCompare(b);
                                                                        });
                                                                        return presentCategories.map((cat)=>{
                                                                            const catSgs = newSgs.filter((sg)=>(sg.category || "Other") === cat);
                                                                            if (catSgs.length === 0) return null;
                                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Fragment, {
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "px-4 py-1.5 bg-neutral-950/80 text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-b border-neutral-900 flex items-center gap-2",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "w-1 h-3 bg-blue-500/50 rounded-full"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                                                lineNumber: 695,
                                                                                                columnNumber: 85
                                                                                            }, this),
                                                                                            cat
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                                        lineNumber: 694,
                                                                                        columnNumber: 81
                                                                                    }, this),
                                                                                    catSgs.map(renderSubgroupRow)
                                                                                ]
                                                                            }, cat, true, {
                                                                                fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                                lineNumber: 693,
                                                                                columnNumber: 77
                                                                            }, this);
                                                                        });
                                                                    })()
                                                                ]
                                                            }, void 0, true),
                                                            existingSgs.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "p-2 bg-neutral-900 font-semibold text-xs text-neutral-400 uppercase tracking-wider sticky top-0 z-10 border-y border-y-neutral-800",
                                                                        children: [
                                                                            "Existing (",
                                                                            existingSgs.length,
                                                                            ")"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                        lineNumber: 707,
                                                                        columnNumber: 65
                                                                    }, this),
                                                                    existingSgs.map(renderSubgroupRow)
                                                                ]
                                                            }, void 0, true)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                        lineNumber: 660,
                                                        columnNumber: 53
                                                    }, this);
                                                })()
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                            lineNumber: 582,
                                            columnNumber: 41
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                        lineNumber: 578,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TabsContent"], {
                                        value: "settings",
                                        className: "p-0 m-0",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col divide-y divide-neutral-800/50",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "p-3 bg-blue-900/10 border-b border-neutral-800 text-xs text-blue-300 px-4",
                                                    children: "Select global settings you want to override from the template."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                    lineNumber: 722,
                                                    columnNumber: 41
                                                }, this),
                                                (()=>{
                                                    const availableKeys = [
                                                        "intro_skip_times",
                                                        "catalog_cache_duration",
                                                        "metadata_cache_duration",
                                                        "image_cache_duration",
                                                        "recommendation_cache_duration",
                                                        "isASSUseImageRender",
                                                        "isSRTUseImageRender",
                                                        "preferred_audio_language",
                                                        "preferred_subtitle_language",
                                                        "always_show_titles",
                                                        "show_metadata_provider",
                                                        "show_metadata_tags",
                                                        "hide_spoilers",
                                                        "high_contrast_focus",
                                                        "oled_mode_enabled"
                                                    ].filter((key)=>importedValues[key] !== undefined);
                                                    if (availableKeys.length === 0) {
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "p-8 text-center text-neutral-500 italic",
                                                            children: "No common settings found in this file."
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                            lineNumber: 745,
                                                            columnNumber: 56
                                                        }, this);
                                                    }
                                                    return availableKeys.map((key)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center p-4 hover:bg-neutral-900/50 transition-colors",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$checkbox$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Checkbox"], {
                                                                    id: `setting-${key}`,
                                                                    checked: selectedGlobalKeys.has(key),
                                                                    onCheckedChange: ()=>{
                                                                        const next = new Set(selectedGlobalKeys);
                                                                        if (next.has(key)) next.delete(key);
                                                                        else next.add(key);
                                                                        setSelectedGlobalKeys(next);
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                    lineNumber: 750,
                                                                    columnNumber: 53
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "ml-3 flex-1 min-w-0 pr-4 cursor-pointer",
                                                                    onClick: ()=>{
                                                                        const next = new Set(selectedGlobalKeys);
                                                                        if (next.has(key)) next.delete(key);
                                                                        else next.add(key);
                                                                        setSelectedGlobalKeys(next);
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            htmlFor: `setting-${key}`,
                                                                            className: "font-semibold text-sm block pointer-events-none capitalize",
                                                                            children: key.replace(/_/g, ' ')
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                            lineNumber: 766,
                                                                            columnNumber: 57
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "text-[10px] text-neutral-500 mt-0.5 font-mono truncate",
                                                                            children: [
                                                                                "Value: ",
                                                                                JSON.stringify(importedValues[key])
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                            lineNumber: 769,
                                                                            columnNumber: 57
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                                    lineNumber: 760,
                                                                    columnNumber: 53
                                                                }, this)
                                                            ]
                                                        }, key, true, {
                                                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                                            lineNumber: 749,
                                                            columnNumber: 49
                                                        }, this));
                                                })()
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                            lineNumber: 721,
                                            columnNumber: 37
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                        lineNumber: 720,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                lineNumber: 529,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                            lineNumber: 528,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                    lineNumber: 515,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DialogFooter"], {
                    className: "mt-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "ghost",
                            onClick: handleClose,
                            className: "text-neutral-400 hover:text-white",
                            children: "Cancel"
                        }, void 0, false, {
                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                            lineNumber: 784,
                            columnNumber: 21
                        }, this),
                        step === 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: handleImport,
                            disabled: totalSelectedToImport === 0 && selectedGlobalKeys.size === 0,
                            className: "bg-blue-600 hover:bg-blue-700 text-white font-bold",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$braces$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileJson$3e$__["FileJson"], {
                                    className: "w-4 h-4 mr-2"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                                    lineNumber: 793,
                                    columnNumber: 29
                                }, this),
                                "Import Selected (",
                                totalSelectedToImport,
                                ")"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                            lineNumber: 788,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
                    lineNumber: 783,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
            lineNumber: 430,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/editor/ImportSetupModal.tsx",
        lineNumber: 429,
        columnNumber: 9
    }, this);
}
}),
];

//# sourceMappingURL=src_components_editor_ImportSetupModal_tsx_ae66fda3._.js.map