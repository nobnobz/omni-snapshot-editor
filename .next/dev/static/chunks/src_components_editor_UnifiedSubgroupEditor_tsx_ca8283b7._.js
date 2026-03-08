(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/editor/UnifiedSubgroupEditor.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UnifiedSubgroupEditor",
    ()=>UnifiedSubgroupEditor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ConfigContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/ConfigContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/dropdown-menu.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@dnd-kit/core/dist/core.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@dnd-kit/sortable/dist/sortable.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@dnd-kit/utilities/dist/utilities.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grip$2d$vertical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GripVertical$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/grip-vertical.js [app-client] (ecmascript) <export default as GripVertical>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ImageIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/image.js [app-client] (ecmascript) <export default as ImageIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-client] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panels$2d$top$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layout$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/panels-top-left.js [app-client] (ecmascript) <export default as Layout>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/accordion.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/alert-dialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$editor$2f$RenameGroupModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/editor/RenameGroupModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$editor$2f$CreateGroupModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/editor/CreateGroupModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$editor$2f$AddToGroupModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/editor/AddToGroupModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$editor$2f$ImportSetupModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/editor/ImportSetupModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$editor$2f$TrashBin$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/editor/TrashBin.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$catalog$2d$fallbacks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/catalog-fallbacks.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderPlus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/folder-plus.js [app-client] (ecmascript) <export default as FolderPlus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UploadCloud$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/cloud-upload.js [app-client] (ecmascript) <export default as UploadCloud>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pencil$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pencil$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pencil.js [app-client] (ecmascript) <export default as Pencil>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/label.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature();
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
;
;
;
;
;
;
;
;
// ----------------------------------------------------------------------
// 1. Sortable Catalog Node (Inside a Subgroup)
// ----------------------------------------------------------------------
function SortableCatalogNode({ id, onRemove }) {
    _s();
    const { currentValues, updateValue } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ConfigContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useConfig"])();
    // Construct effective custom names (Config Custom Names > AIOMetadata > Default)
    const configCustomNames = currentValues["custom_catalog_names"] || {};
    let aioFallbacks = {};
    if ("TURBOPACK compile-time truthy", 1) {
        try {
            aioFallbacks = JSON.parse(localStorage.getItem("omni_custom_fallbacks") || "{}");
        } catch (e) {}
    }
    // Some IDs have prefixes like 'movie:mdblist.12306', AIOMetadata uses 'mdblist.12306'
    let baseId = id;
    if (id.includes(":")) {
        const parts = id.split(":");
        if (parts.length === 2 && [
            "movie",
            "series",
            "anime"
        ].includes(parts[0])) {
            baseId = parts[1];
        } else if (id.startsWith("movie:trakt-list") || id.startsWith("series:trakt-list")) {
        // keep it if complex, or try to extract
        } else {
            // Fallback for generic prefix stripping if it matches common AIO formats
            baseId = parts.slice(1).join(":");
        }
    }
    // Specific match for AIO Trakt format if necessary (this is a best effort)
    const strippedTraktId = id.replace(/^(movie|series|anime):/, "");
    const customNameFromConfig = configCustomNames[id] || configCustomNames[baseId];
    const customNameFromAIO = aioFallbacks[id] || aioFallbacks[baseId] || aioFallbacks[strippedTraktId];
    let displayName = "";
    if (customNameFromConfig && customNameFromConfig.trim() !== "" && customNameFromConfig !== id) {
        displayName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDisplayName"])(customNameFromConfig);
    } else if (customNameFromAIO && customNameFromAIO.trim() !== "" && customNameFromAIO !== id) {
        displayName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDisplayName"])(customNameFromAIO);
    } else {
        // use standard resolveCatalogName mapped values or Fallbacks
        displayName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resolveCatalogName"])(id, {});
    }
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSortable"])({
        id
    });
    const style = {
        transform: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CSS"].Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : 1
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: setNodeRef,
        style: style,
        className: `flex items-center gap-3 p-2.5 bg-neutral-950/50 border border-neutral-800/60 rounded-lg mb-2 group/cat transition-all duration-200 hover:border-neutral-700/80 hover:bg-neutral-900/60 shadow-sm ${isDragging ? "opacity-50 border-blue-500 z-50 shadow-2xl scale-[1.02]" : ""}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                ...attributes,
                ...listeners,
                className: "cursor-grab text-neutral-600 hover:text-white shrink-0 p-1 rounded-md hover:bg-neutral-800 transition-colors",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grip$2d$vertical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GripVertical$3e$__["GripVertical"], {
                    className: "h-4 w-4"
                }, void 0, false, {
                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                    lineNumber: 124,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                lineNumber: 123,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 min-w-0 pr-2 flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[12px] truncate font-semibold tracking-tight text-neutral-200",
                        children: displayName
                    }, void 0, false, {
                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                        lineNumber: 128,
                        columnNumber: 17
                    }, this),
                    displayName !== id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[9px] text-neutral-500 font-mono bg-neutral-900 px-1.5 py-0.5 rounded-sm border border-neutral-800 opacity-0 group-hover/cat:opacity-100 transition-opacity",
                        children: id
                    }, void 0, false, {
                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                        lineNumber: 132,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                lineNumber: 127,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1 shrink-0 opacity-80 hover:opacity-100 transition-opacity",
                children: onRemove && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                    variant: "ghost",
                    size: "icon",
                    onClick: (e)=>{
                        e.stopPropagation();
                        onRemove();
                    },
                    className: "h-7 w-7 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors rounded-md border border-transparent hover:border-red-500/30",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                        className: "h-3.5 w-3.5"
                    }, void 0, false, {
                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                        lineNumber: 146,
                        columnNumber: 25
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                    lineNumber: 140,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                lineNumber: 138,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
        lineNumber: 118,
        columnNumber: 9
    }, this);
}
_s(SortableCatalogNode, "i0g2bMLWreeCzrEOOep8ugGHAJo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ConfigContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useConfig"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSortable"]
    ];
});
_c = SortableCatalogNode;
// ----------------------------------------------------------------------
// 2. Sortable Subgroup Node containing Catalogs & URL
// ----------------------------------------------------------------------
function SortableSubgroupNode({ subgroupName, parentUUID, onUnassign, isExpanded: propIsExpanded, onToggle }) {
    _s1();
    const { originalConfig, currentValues, updateValue, renameCatalogGroup, removeCatalogGroup, unassignCatalogGroup, catalogs, customFallbacks, addManifestCatalog } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ConfigContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useConfig"])();
    // Sortable Hook for the subgroup itself
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSortable"])({
        id: subgroupName
    });
    const style = {
        transform: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CSS"].Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : 1
    };
    // Subgroup state
    const catalogsList = currentValues.catalog_groups?.[subgroupName] || [];
    const imageUrl = currentValues.catalog_group_image_urls?.[subgroupName] || "";
    const [subgroupCatalogs, setSubgroupCatalogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(catalogsList);
    const [urlInput, setUrlInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(imageUrl);
    const [isRenaming, setIsRenaming] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isAddMenuOpen, setIsAddMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [catalogSearch, setCatalogSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const customNames = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useMemo({
        "SortableSubgroupNode.useMemo[customNames]": ()=>currentValues["custom_catalog_names"] || {}
    }["SortableSubgroupNode.useMemo[customNames]"], [
        currentValues
    ]);
    const catalogOptions = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useMemo({
        "SortableSubgroupNode.useMemo[catalogOptions]": ()=>{
            const options = [];
            // 1. All existing catalogs not already in subgroupCatalogs
            const existingBaseIds = new Set();
            for (const c of catalogs){
                existingBaseIds.add(c.id.replace(/^(movie:|series:)/, ''));
                if (!subgroupCatalogs.includes(c.id)) {
                    options.push({
                        id: c.id,
                        name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resolveCatalogName"])(c.id, customNames) || c.name || c.id
                    });
                }
            }
            // 2. Fallbacks not already in subgroupCatalogs
            const allFallbacks = {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$catalog$2d$fallbacks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CATALOG_FALLBACKS"],
                ...customFallbacks
            };
            Object.entries(allFallbacks).forEach({
                "SortableSubgroupNode.useMemo[catalogOptions]": ([id, name])=>{
                    if (!existingBaseIds.has(id.replace(/^(movie:|series:)/, ''))) {
                        const displayName = customNames[id] || name;
                        let finalId = id;
                        if (!id.includes(':')) {
                            const lowerName = displayName.toLowerCase();
                            let typePrefix = "movie:"; // default
                            if (lowerName.includes("show") || lowerName.includes("series") || lowerName.includes("tv")) {
                                typePrefix = "series:";
                            }
                            finalId = `${typePrefix}${id}`;
                        }
                        if (!subgroupCatalogs.includes(finalId)) {
                            options.push({
                                id: finalId,
                                name: displayName
                            });
                        }
                    }
                }
            }["SortableSubgroupNode.useMemo[catalogOptions]"]);
            // Sort options
            return options.sort({
                "SortableSubgroupNode.useMemo[catalogOptions]": (a, b)=>a.name.localeCompare(b.name)
            }["SortableSubgroupNode.useMemo[catalogOptions]"]);
        }
    }["SortableSubgroupNode.useMemo[catalogOptions]"], [
        catalogs,
        customFallbacks,
        customNames,
        subgroupCatalogs
    ]);
    const filteredCatalogs = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useMemo({
        "SortableSubgroupNode.useMemo[filteredCatalogs]": ()=>{
            if (!catalogSearch) return catalogOptions;
            const q = catalogSearch.toLowerCase();
            return catalogOptions.filter({
                "SortableSubgroupNode.useMemo[filteredCatalogs]": (c)=>c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
            }["SortableSubgroupNode.useMemo[filteredCatalogs]"]);
        }
    }["SortableSubgroupNode.useMemo[filteredCatalogs]"], [
        catalogOptions,
        catalogSearch
    ]);
    // Support controlled or uncontrolled expansion
    const [localExpanded, setLocalExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const isExpanded = propIsExpanded !== undefined ? propIsExpanded : localExpanded;
    const toggleExpanded = onToggle || (()=>setLocalExpanded(!localExpanded));
    const parentName = currentValues.main_catalog_groups?.[parentUUID]?.name || "";
    const isLandscape = [
        "discover",
        "streaming services",
        "decades",
        "collection",
        "collections"
    ].includes(parentName.toLowerCase());
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "SortableSubgroupNode.useEffect": ()=>{
            setSubgroupCatalogs(catalogsList);
            setUrlInput(imageUrl);
        }
    }["SortableSubgroupNode.useEffect"], [
        JSON.stringify(catalogsList),
        imageUrl
    ]);
    const handleUrlBlur = ()=>{
        if (urlInput !== imageUrl) {
            updateValue([
                "catalog_group_image_urls",
                subgroupName
            ], urlInput);
        }
    };
    const sensors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSensors"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSensor"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PointerSensor"]), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSensor"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KeyboardSensor"], {
        coordinateGetter: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sortableKeyboardCoordinates"]
    }));
    const handleCatalogDragEnd = (event)=>{
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = subgroupCatalogs.indexOf(active.id);
            const newIndex = subgroupCatalogs.indexOf(over.id);
            const newArray = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayMove"])(subgroupCatalogs, oldIndex, newIndex);
            setSubgroupCatalogs(newArray);
            updateValue([
                "catalog_groups",
                subgroupName
            ], newArray);
        }
    };
    const handleAddCatalog = (e, catalogId)=>{
        e.preventDefault();
        if (!catalogId.trim()) return;
        const name = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resolveCatalogName"])(catalogId.trim(), currentValues.custom_catalog_names || {});
        const normalizedId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ensureCatalogPrefix"])(catalogId.trim(), name);
        const updated = [
            ...subgroupCatalogs,
            normalizedId
        ];
        setSubgroupCatalogs(updated);
        updateValue([
            "catalog_groups",
            subgroupName
        ], updated);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: setNodeRef,
        style: style,
        className: `border border-neutral-800/80 shadow-sm rounded-xl overflow-hidden mb-4 bg-neutral-950/40 transition-all hover:border-neutral-700/80 group/subgroup ${isDragging ? "opacity-50 border-blue-500 scale-[1.01] shadow-2xl" : ""}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `flex items-center gap-3 p-3 bg-neutral-900/40 backdrop-blur-sm border-neutral-800/50 ${isExpanded ? "border-b border-neutral-800/60" : ""}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        ...attributes,
                        ...listeners,
                        className: "cursor-grab hover:text-white text-neutral-500 p-1 rounded-md hover:bg-neutral-800/80 transition-colors",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grip$2d$vertical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GripVertical$3e$__["GripVertical"], {
                            className: "h-4 w-4"
                        }, void 0, false, {
                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                            lineNumber: 289,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                        lineNumber: 288,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 font-semibold text-sm text-neutral-200 cursor-pointer flex items-center select-none tracking-tight",
                        onClick: toggleExpanded,
                        children: [
                            isExpanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                className: "w-4 h-4 mr-2 text-neutral-400 group-hover:text-white transition-colors"
                            }, void 0, false, {
                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                lineNumber: 295,
                                columnNumber: 35
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                className: "w-4 h-4 mr-2 text-neutral-500 group-hover:text-white transition-colors"
                            }, void 0, false, {
                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                lineNumber: 295,
                                columnNumber: 136
                            }, this),
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDisplayName"])(subgroupName)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                        lineNumber: 291,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                variant: "ghost",
                                size: "icon",
                                onClick: ()=>setIsRenaming(true),
                                className: "h-7 w-7 text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors rounded-md border border-transparent hover:border-neutral-700/50",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pencil$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pencil$3e$__["Pencil"], {
                                    className: "h-3.5 w-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                    lineNumber: 300,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                lineNumber: 299,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                variant: "ghost",
                                size: "icon",
                                onClick: ()=>{
                                    unassignCatalogGroup(subgroupName);
                                    if (onUnassign) onUnassign(subgroupName, parentUUID);
                                },
                                className: "h-7 w-7 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors rounded-md border border-transparent hover:border-red-500/30",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                    className: "h-3.5 w-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                    lineNumber: 306,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                lineNumber: 302,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                        lineNumber: 298,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                lineNumber: 287,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$editor$2f$RenameGroupModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RenameGroupModal"], {
                isOpen: isRenaming,
                onClose: ()=>setIsRenaming(false),
                oldName: subgroupName,
                isMainGroup: false,
                onRename: (oldN, newN)=>{
                    setIsRenaming(false);
                    renameCatalogGroup(oldN, newN);
                }
            }, void 0, false, {
                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                lineNumber: 311,
                columnNumber: 13
            }, this),
            isExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 space-y-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3 bg-neutral-950/50 p-3 rounded-lg border border-neutral-800/60 shadow-inner",
                        children: [
                            urlInput && urlInput.startsWith("http") ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `${isLandscape ? "h-10 w-16" : "h-14 w-10"} rounded-md shrink-0 overflow-hidden bg-neutral-900 border border-neutral-700 shadow-sm flex items-center justify-center`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: urlInput,
                                    alt: "Thumb",
                                    className: "h-full w-full object-cover",
                                    onError: (e)=>{
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-500"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                    lineNumber: 328,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                lineNumber: 327,
                                columnNumber: 29
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-10 w-10 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ImageIcon$3e$__["ImageIcon"], {
                                    className: "w-4 h-4 text-neutral-500"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                    lineNumber: 340,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                lineNumber: 339,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 space-y-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                        className: "text-[10px] uppercase font-bold tracking-widest text-neutral-500",
                                        children: "Poster Image URL"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                        lineNumber: 344,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                        placeholder: "https://...",
                                        value: urlInput,
                                        onChange: (e)=>setUrlInput(e.target.value),
                                        onBlur: handleUrlBlur,
                                        className: "h-8 text-xs bg-neutral-950/80 border-neutral-700 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-inner transition-colors font-mono"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                        lineNumber: 345,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                lineNumber: 343,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                        lineNumber: 325,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between mb-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                                        className: "text-[10px] font-bold text-neutral-500 uppercase tracking-widest",
                                        children: "Linked Catalogs"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                        lineNumber: 358,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] font-medium text-neutral-600 bg-neutral-900 px-2 py-0.5 rounded-full border border-neutral-800",
                                        children: subgroupCatalogs.length
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                        lineNumber: 359,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                lineNumber: 357,
                                columnNumber: 25
                            }, this),
                            subgroupCatalogs.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center py-6 border border-dashed border-neutral-800/60 rounded-lg bg-neutral-950/30",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-neutral-500 font-medium",
                                    children: "No catalogs in this subgroup yet."
                                }, void 0, false, {
                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                    lineNumber: 364,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                lineNumber: 363,
                                columnNumber: 29
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-0.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DndContext"], {
                                    sensors: sensors,
                                    collisionDetection: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["closestCenter"],
                                    onDragEnd: handleCatalogDragEnd,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SortableContext"], {
                                        items: subgroupCatalogs,
                                        strategy: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["verticalListSortingStrategy"],
                                        children: subgroupCatalogs.map((catId)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortableCatalogNode, {
                                                id: catId,
                                                onRemove: ()=>{
                                                    const updated = subgroupCatalogs.filter((id)=>id !== catId);
                                                    setSubgroupCatalogs(updated);
                                                    updateValue([
                                                        "catalog_groups",
                                                        subgroupName
                                                    ], updated);
                                                }
                                            }, catId, false, {
                                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                lineNumber: 371,
                                                columnNumber: 45
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                        lineNumber: 369,
                                        columnNumber: 37
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                    lineNumber: 368,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                lineNumber: 367,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-3",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenu"], {
                                    open: isAddMenuOpen,
                                    onOpenChange: (open)=>{
                                        setIsAddMenuOpen(open);
                                        if (!open) setCatalogSearch("");
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuTrigger"], {
                                            asChild: true,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                size: "sm",
                                                variant: "outline",
                                                className: "w-full justify-start text-xs border border-dashed border-neutral-700/60 bg-neutral-950/30 text-neutral-400 hover:text-white hover:bg-neutral-800/80 hover:border-neutral-600 transition-colors",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                        className: "w-3.5 h-3.5 mr-2"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                        lineNumber: 394,
                                                        columnNumber: 41
                                                    }, this),
                                                    " Add Catalog..."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                lineNumber: 393,
                                                columnNumber: 37
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                            lineNumber: 392,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuContent"], {
                                            className: "w-80 bg-neutral-900 border-neutral-800 text-neutral-200 shadow-2xl p-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "p-3 border-b border-neutral-800 bg-neutral-950 space-y-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                            className: "text-[10px] uppercase font-bold text-neutral-500 flex justify-between",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: "Select Catalog"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                                    lineNumber: 400,
                                                                    columnNumber: 45
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-neutral-600",
                                                                    children: [
                                                                        filteredCatalogs.length,
                                                                        " available"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                                    lineNumber: 401,
                                                                    columnNumber: 45
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                            lineNumber: 399,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "relative",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                                    className: "absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-500"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                                    lineNumber: 404,
                                                                    columnNumber: 45
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                                    placeholder: "Search by name or ID...",
                                                                    value: catalogSearch,
                                                                    onChange: (e)=>setCatalogSearch(e.target.value),
                                                                    className: "h-7 text-[11px] pl-7 bg-neutral-900 border-neutral-800 focus-visible:ring-blue-600",
                                                                    autoFocus: true,
                                                                    onKeyDown: (e)=>e.stopPropagation()
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                                    lineNumber: 405,
                                                                    columnNumber: 45
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                            lineNumber: 403,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                    lineNumber: 398,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "max-h-[320px] overflow-y-auto p-1 pt-0 custom-scrollbar",
                                                    children: filteredCatalogs.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[10px] text-neutral-600 p-4 text-center",
                                                        children: "No catalogs found."
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                        lineNumber: 417,
                                                        columnNumber: 45
                                                    }, this) : (()=>{
                                                        const groups = {
                                                            "Other": []
                                                        };
                                                        filteredCatalogs.forEach((c)=>{
                                                            const match = c.name.match(/^\[(.*?)\]\s*(.*)$/);
                                                            if (match) {
                                                                const category = match[1];
                                                                const cleanName = match[2];
                                                                if (!groups[category]) groups[category] = [];
                                                                groups[category].push({
                                                                    ...c,
                                                                    name: cleanName
                                                                });
                                                            } else {
                                                                groups["Other"].push(c);
                                                            }
                                                        });
                                                        const sortedCategories = Object.keys(groups).filter((k)=>k !== "Other").sort((a, b)=>a.localeCompare(b));
                                                        if (groups["Other"].length > 0) {
                                                            sortedCategories.push("Other");
                                                        }
                                                        return sortedCategories.map((category)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "mb-2 last:mb-0",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "sticky top-0 bg-neutral-900 py-1.5 px-3 z-[60] border-b border-neutral-800/80 mb-1 -mx-1",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                                                                            className: "text-[10px] font-bold text-blue-400 uppercase tracking-wider",
                                                                            children: category
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                                            lineNumber: 446,
                                                                            columnNumber: 61
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                                        lineNumber: 445,
                                                                        columnNumber: 57
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex flex-col gap-0.5 px-1",
                                                                        children: groups[category].map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                                                                                onSelect: (e)=>handleAddCatalog(e, c.id),
                                                                                className: "flex items-start gap-2 p-2 rounded cursor-pointer focus:bg-blue-500/10 focus:text-blue-400",
                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "flex-1 min-w-0",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                            className: "text-sm font-medium truncate",
                                                                                            children: c.name
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                                                            lineNumber: 456,
                                                                                            columnNumber: 73
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                            className: "text-[9px] text-neutral-500 font-mono truncate",
                                                                                            children: c.id
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                                                            lineNumber: 457,
                                                                                            columnNumber: 73
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                                                    lineNumber: 455,
                                                                                    columnNumber: 69
                                                                                }, this)
                                                                            }, c.id, false, {
                                                                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                                                lineNumber: 450,
                                                                                columnNumber: 65
                                                                            }, this))
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                                        lineNumber: 448,
                                                                        columnNumber: 57
                                                                    }, this)
                                                                ]
                                                            }, category, true, {
                                                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                                lineNumber: 444,
                                                                columnNumber: 53
                                                            }, this));
                                                    })()
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                    lineNumber: 415,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                            lineNumber: 397,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                    lineNumber: 388,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                lineNumber: 387,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                        lineNumber: 356,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                lineNumber: 323,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
        lineNumber: 285,
        columnNumber: 9
    }, this);
}
_s1(SortableSubgroupNode, "JZyILf5B9wzwY5YEXZah42yiwjw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ConfigContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useConfig"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSortable"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSensors"]
    ];
});
_c1 = SortableSubgroupNode;
// ----------------------------------------------------------------------
// 3. Main Group View (Outer)
// ----------------------------------------------------------------------
function MainGroupNode({ uuid, name, subgroupNames, onUnassignSubgroup, onAddSubgroup }) {
    _s2();
    const { initialValues, currentValues, updateValue, renameMainCatalogGroup, removeMainCatalogGroup } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ConfigContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useConfig"])();
    const [isRenaming, setIsRenaming] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const mainGroupData = currentValues.main_catalog_groups?.[uuid] || {};
    const posterType = mainGroupData.posterType || "Poster";
    const posterSize = mainGroupData.posterSize || "Default";
    // Sortable Hook for the Main Group itself
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSortable"])({
        id: uuid
    });
    const style = {
        transform: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CSS"].Transform.toString(transform),
        transition,
        zIndex: isDragging ? 30 : 1
    };
    // We maintain local subgroup ordering state
    const [subgroups, setSubgroups] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(subgroupNames);
    const [sortDirection, setSortDirection] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('asc');
    const [expandedSubgroup, setExpandedSubgroup] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "MainGroupNode.useEffect": ()=>{
            setSubgroups(subgroupNames);
        }
    }["MainGroupNode.useEffect"], [
        JSON.stringify(subgroupNames)
    ]);
    const sensors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSensors"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSensor"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PointerSensor"]), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSensor"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KeyboardSensor"], {
        coordinateGetter: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sortableKeyboardCoordinates"]
    }));
    const handleSubgroupDragEnd = (event)=>{
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = subgroups.indexOf(active.id);
            const newIndex = subgroups.indexOf(over.id);
            const newArray = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayMove"])(subgroups, oldIndex, newIndex);
            setSubgroups(newArray);
            // We need to update both subgroup_order and main_catalog_groups.subgroupNames
            updateValue([
                "subgroup_order",
                uuid
            ], newArray);
            updateValue([
                "main_catalog_groups",
                uuid,
                "subgroupNames"
            ], newArray);
        }
    };
    const toggleSort = ()=>{
        const nextDir = sortDirection === 'asc' ? 'desc' : 'asc';
        const sorted = [
            ...subgroups
        ].sort((a, b)=>{
            return nextDir === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
        });
        setSubgroups(sorted);
        setSortDirection(nextDir);
        updateValue([
            "subgroup_order",
            uuid
        ], sorted);
        updateValue([
            "main_catalog_groups",
            uuid,
            "subgroupNames"
        ], sorted);
    };
    const restoreOrder = ()=>{
        const orig = initialValues?.subgroup_order?.[uuid];
        if (orig && Array.isArray(orig)) {
            setSubgroups(orig);
            setSortDirection('asc'); // Reset direction indicator
            updateValue([
                "subgroup_order",
                uuid
            ], orig);
            updateValue([
                "main_catalog_groups",
                uuid,
                "subgroupNames"
            ], orig);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: setNodeRef,
        style: style,
        className: `border border-neutral-800/80 rounded-xl overflow-hidden bg-neutral-950/40 shadow-sm transition-all hover:border-neutral-700/80 ${isDragging ? "opacity-50 border-blue-500 scale-[1.01] shadow-2xl" : ""}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AccordionItem"], {
            value: uuid,
            className: "border-none",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AccordionTrigger"], {
                    className: "w-full justify-between items-center p-4 hover:bg-neutral-900/40 hover:no-underline flex text-sm transition-colors group",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-1 items-center gap-4 text-left",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                ...attributes,
                                ...listeners,
                                className: "cursor-grab text-neutral-600 hover:text-white shrink-0 p-1.5 rounded-md hover:bg-neutral-800 transition-colors pointer-events-auto",
                                onClick: (e)=>e.stopPropagation(),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grip$2d$vertical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GripVertical$3e$__["GripVertical"], {
                                    className: "h-5 w-5"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                    lineNumber: 560,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                lineNumber: 559,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "font-bold text-base tracking-tight text-neutral-100 flex items-center gap-2",
                                        children: [
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDisplayName"])(name),
                                            posterSize !== "Default" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                variant: "outline",
                                                className: "text-[9px] uppercase tracking-widest bg-blue-500/10 text-blue-400 border-blue-500/30",
                                                children: posterSize
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                lineNumber: 566,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                        lineNumber: 563,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-[11px] text-neutral-500 font-medium mt-0.5 flex items-center gap-2",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: [
                                                subgroupNames.length,
                                                " Subgroups"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                            lineNumber: 572,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                        lineNumber: 571,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                lineNumber: 562,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                        lineNumber: 558,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                    lineNumber: 557,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AccordionContent"], {
                    className: "p-5 border-t border-neutral-800/50 bg-neutral-900/20",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 bg-neutral-950/50 border border-neutral-800 rounded-lg p-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenu"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuTrigger"], {
                                                asChild: true,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    variant: "ghost",
                                                    size: "sm",
                                                    className: "h-8 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 font-medium tracking-tight",
                                                    children: [
                                                        "Layout: ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-white ml-1 font-bold",
                                                            children: [
                                                                posterType,
                                                                " / ",
                                                                posterSize
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                            lineNumber: 585,
                                                            columnNumber: 49
                                                        }, this),
                                                        " ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                            className: "w-3.5 h-3.5 ml-1 opacity-50"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                            lineNumber: 585,
                                                            columnNumber: 128
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                    lineNumber: 584,
                                                    columnNumber: 37
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                lineNumber: 583,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuContent"], {
                                                className: "bg-neutral-900 border-neutral-800 text-neutral-200",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuLabel"], {
                                                        className: "text-[10px] uppercase tracking-widest text-neutral-500 font-bold",
                                                        children: "Poster Shape"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                        lineNumber: 589,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                                                        onClick: ()=>updateValue([
                                                                "main_catalog_groups",
                                                                uuid,
                                                                "posterType"
                                                            ], "Poster"),
                                                        className: `text-xs ${posterType === "Poster" ? "bg-blue-500/20 text-blue-400" : ""}`,
                                                        children: [
                                                            "Poster ",
                                                            posterType === "Poster" && "✓"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                        lineNumber: 590,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                                                        onClick: ()=>updateValue([
                                                                "main_catalog_groups",
                                                                uuid,
                                                                "posterType"
                                                            ], "Square"),
                                                        className: `text-xs ${posterType === "Square" ? "bg-blue-500/20 text-blue-400" : ""}`,
                                                        children: [
                                                            "Square ",
                                                            posterType === "Square" && "✓"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                        lineNumber: 593,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                                                        onClick: ()=>updateValue([
                                                                "main_catalog_groups",
                                                                uuid,
                                                                "posterType"
                                                            ], "Landscape"),
                                                        className: `text-xs ${posterType === "Landscape" ? "bg-blue-500/20 text-blue-400" : ""}`,
                                                        children: [
                                                            "Landscape ",
                                                            posterType === "Landscape" && "✓"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                        lineNumber: 596,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuSeparator"], {
                                                        className: "bg-neutral-800"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                        lineNumber: 599,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuLabel"], {
                                                        className: "text-[10px] uppercase tracking-widest text-neutral-500 font-bold",
                                                        children: "Poster Size"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                        lineNumber: 600,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                                                        onClick: ()=>updateValue([
                                                                "main_catalog_groups",
                                                                uuid,
                                                                "posterSize"
                                                            ], "Default"),
                                                        className: `text-xs ${posterSize === "Default" ? "bg-blue-500/20 text-blue-400" : ""}`,
                                                        children: [
                                                            "Default ",
                                                            posterSize === "Default" && "✓"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                        lineNumber: 601,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                                                        onClick: ()=>updateValue([
                                                                "main_catalog_groups",
                                                                uuid,
                                                                "posterSize"
                                                            ], "Small"),
                                                        className: `text-xs ${posterSize === "Small" ? "bg-blue-500/20 text-blue-400" : ""}`,
                                                        children: [
                                                            "Small ",
                                                            posterSize === "Small" && "✓"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                        lineNumber: 607,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                lineNumber: 588,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                        lineNumber: 582,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-px h-4 bg-neutral-800 mx-1"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                        lineNumber: 615,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        variant: "ghost",
                                        size: "sm",
                                        onClick: ()=>setIsRenaming(true),
                                        className: "h-8 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 font-medium tracking-tight",
                                        children: "Rename"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                        lineNumber: 616,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialog"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogTrigger"], {
                                                asChild: true,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    variant: "ghost",
                                                    size: "sm",
                                                    className: "h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 font-medium tracking-tight ml-auto sm:ml-0",
                                                    children: "Disable"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                    lineNumber: 627,
                                                    columnNumber: 37
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                lineNumber: 626,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogContent"], {
                                                className: "bg-neutral-900 border-neutral-800 text-neutral-100",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogHeader"], {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogTitle"], {
                                                                children: "Disable Main Group?"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                                lineNumber: 637,
                                                                columnNumber: 41
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogDescription"], {
                                                                className: "text-neutral-400",
                                                                children: [
                                                                    "This will hide the group ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-white font-bold",
                                                                        children: [
                                                                            '"',
                                                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDisplayName"])(name),
                                                                            '"'
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                                        lineNumber: 639,
                                                                        columnNumber: 70
                                                                    }, this),
                                                                    " and all its subgroups. You can restore them anytime from the Recycle Bin at the bottom."
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                                lineNumber: 638,
                                                                columnNumber: 41
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                        lineNumber: 636,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogFooter"], {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogCancel"], {
                                                                className: "bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white",
                                                                children: "Cancel"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                                lineNumber: 643,
                                                                columnNumber: 41
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogAction"], {
                                                                onClick: ()=>removeMainCatalogGroup(uuid),
                                                                className: "bg-red-600 text-white hover:bg-red-700 font-bold",
                                                                children: "Disable Group"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                                lineNumber: 644,
                                                                columnNumber: 41
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                        lineNumber: 642,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                lineNumber: 635,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                        lineNumber: 625,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-px h-4 bg-neutral-800 mx-1"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                        lineNumber: 654,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        variant: "secondary",
                                        size: "sm",
                                        onClick: ()=>onAddSubgroup?.(uuid),
                                        className: "h-8 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 border border-blue-500/20 hover:border-blue-500/40 transition-all flex items-center gap-1.5 px-3 rounded-lg font-semibold shadow-sm",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                className: "w-4 h-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                lineNumber: 661,
                                                columnNumber: 33
                                            }, this),
                                            "New Subgroup"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                        lineNumber: 655,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                lineNumber: 581,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                            lineNumber: 580,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$editor$2f$RenameGroupModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RenameGroupModal"], {
                            isOpen: isRenaming,
                            onClose: ()=>setIsRenaming(false),
                            oldName: name,
                            isMainGroup: true,
                            onRename: (oldN, newN)=>{
                                setIsRenaming(false);
                                renameMainCatalogGroup(uuid, newN);
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                            lineNumber: 667,
                            columnNumber: 21
                        }, this),
                        subgroups.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center py-8 border border-dashed border-neutral-800/80 rounded-xl bg-neutral-950/30 flex flex-col items-center justify-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderPlus$3e$__["FolderPlus"], {
                                    className: "w-8 h-8 text-neutral-700"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                    lineNumber: 680,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-medium text-neutral-400",
                                    children: "No subgroups exist here."
                                }, void 0, false, {
                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                    lineNumber: 681,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-neutral-500",
                                    children: 'Add subgroups by clicking "Add to Group" at the top.'
                                }, void 0, false, {
                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                    lineNumber: 682,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                            lineNumber: 679,
                            columnNumber: 25
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-1",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DndContext"], {
                                sensors: sensors,
                                collisionDetection: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["closestCenter"],
                                onDragEnd: handleSubgroupDragEnd,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SortableContext"], {
                                    items: subgroups,
                                    strategy: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["verticalListSortingStrategy"],
                                    children: subgroups.map((sg)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortableSubgroupNode, {
                                            subgroupName: sg,
                                            parentUUID: uuid,
                                            onUnassign: onUnassignSubgroup,
                                            isExpanded: expandedSubgroup === sg,
                                            onToggle: ()=>setExpandedSubgroup(expandedSubgroup === sg ? null : sg)
                                        }, sg, false, {
                                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                            lineNumber: 689,
                                            columnNumber: 41
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                    lineNumber: 687,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                lineNumber: 686,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                            lineNumber: 685,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                    lineNumber: 579,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
            lineNumber: 556,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
        lineNumber: 555,
        columnNumber: 9
    }, this);
}
_s2(MainGroupNode, "Ryf9SPLPTPKxS6CegdBljnT/q08=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ConfigContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useConfig"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSortable"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSensors"]
    ];
});
_c2 = MainGroupNode;
// ----------------------------------------------------------------------
// 3. Global Subgroup Library (List of all catalog_groups)
// ----------------------------------------------------------------------
function UnassignedSubgroupRow({ groupName, catalogs: subgroupCatalogsProp, onRestore, restoreParentName }) {
    _s3();
    const { updateValue, currentValues, assignCatalogGroup, addManifestCatalog, removeCatalogGroup, catalogs: fullCatalogs, customFallbacks } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ConfigContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useConfig"])();
    const mainCatalogGroups = currentValues["main_catalog_groups"] || {};
    const mainGroupOrder = currentValues["main_group_order"] || [];
    const [isExpanded, setIsExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isAddMenuOpen, setIsAddMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [catalogSearch, setCatalogSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const customNames = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useMemo({
        "UnassignedSubgroupRow.useMemo[customNames]": ()=>currentValues["custom_catalog_names"] || {}
    }["UnassignedSubgroupRow.useMemo[customNames]"], [
        currentValues
    ]);
    const catalogOptions = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useMemo({
        "UnassignedSubgroupRow.useMemo[catalogOptions]": ()=>{
            const options = [];
            const existingBaseIds = new Set();
            for (const c of fullCatalogs){
                existingBaseIds.add(c.id.replace(/^(movie:|series:)/, ''));
                if (!subgroupCatalogsProp.includes(c.id)) {
                    options.push({
                        id: c.id,
                        name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resolveCatalogName"])(c.id, customNames) || c.name || c.id
                    });
                }
            }
            const allFallbacks = {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$catalog$2d$fallbacks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CATALOG_FALLBACKS"],
                ...customFallbacks
            };
            Object.entries(allFallbacks).forEach({
                "UnassignedSubgroupRow.useMemo[catalogOptions]": ([id, name])=>{
                    if (!existingBaseIds.has(id.replace(/^(movie:|series:)/, ''))) {
                        const displayName = customNames[id] || name;
                        let finalId = id;
                        if (!id.includes(':')) {
                            const lowerName = displayName.toLowerCase();
                            let typePrefix = "movie:"; // default
                            if (lowerName.includes("show") || lowerName.includes("series") || lowerName.includes("tv")) {
                                typePrefix = "series:";
                            }
                            finalId = `${typePrefix}${id}`;
                        }
                        if (!subgroupCatalogsProp.includes(finalId)) {
                            options.push({
                                id: finalId,
                                name: displayName
                            });
                        }
                    }
                }
            }["UnassignedSubgroupRow.useMemo[catalogOptions]"]);
            return options.sort({
                "UnassignedSubgroupRow.useMemo[catalogOptions]": (a, b)=>a.name.localeCompare(b.name)
            }["UnassignedSubgroupRow.useMemo[catalogOptions]"]);
        }
    }["UnassignedSubgroupRow.useMemo[catalogOptions]"], [
        fullCatalogs,
        customFallbacks,
        customNames,
        subgroupCatalogsProp
    ]);
    const filteredCatalogs = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useMemo({
        "UnassignedSubgroupRow.useMemo[filteredCatalogs]": ()=>{
            if (!catalogSearch) return catalogOptions;
            const q = catalogSearch.toLowerCase();
            return catalogOptions.filter({
                "UnassignedSubgroupRow.useMemo[filteredCatalogs]": (c)=>c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
            }["UnassignedSubgroupRow.useMemo[filteredCatalogs]"]);
        }
    }["UnassignedSubgroupRow.useMemo[filteredCatalogs]"], [
        catalogOptions,
        catalogSearch
    ]);
    const handleAddCatalog = (e, catalogId)=>{
        e.preventDefault();
        if (!catalogId.trim()) return;
        const name = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resolveCatalogName"])(catalogId.trim(), currentValues.custom_catalog_names || {});
        const normalizedId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ensureCatalogPrefix"])(catalogId.trim(), name);
        const updated = [
            ...subgroupCatalogsProp,
            normalizedId
        ];
        updateValue([
            "catalog_groups",
            groupName
        ], updated);
    };
    const handleRemoveCatalog = (catalogId)=>{
        const updated = subgroupCatalogsProp.filter((id)=>id !== catalogId);
        updateValue([
            "catalog_groups",
            groupName
        ], updated);
    };
    const handleReorderCatalogs = (newOrder)=>{
        updateValue([
            "catalog_groups",
            groupName
        ], newOrder);
    };
    const catalogSensors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSensors"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSensor"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PointerSensor"]), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSensor"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KeyboardSensor"], {
        coordinateGetter: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sortableKeyboardCoordinates"]
    }));
    const handleInternalDragEnd = (event)=>{
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = subgroupCatalogsProp.indexOf(active.id);
            const newIndex = subgroupCatalogsProp.indexOf(over.id);
            handleReorderCatalogs((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayMove"])(subgroupCatalogsProp, oldIndex, newIndex));
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden transition-all hover:border-neutral-700 w-full mb-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between p-3 gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 min-w-0 pr-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "font-medium text-neutral-200 text-sm truncate block",
                            title: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDisplayName"])(groupName),
                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDisplayName"])(groupName)
                        }, void 0, false, {
                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                            lineNumber: 817,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                        lineNumber: 816,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 justify-end shrink-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenu"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuTrigger"], {
                                        asChild: true,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: "outline",
                                            size: "sm",
                                            className: "h-7 px-2 text-[10px] font-semibold uppercase tracking-tight text-neutral-400 border-neutral-700/50 hover:bg-neutral-800 hover:text-white flex items-center gap-1 transition-colors",
                                            children: [
                                                "Assign To... ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                    className: "w-3 h-3"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                    lineNumber: 833,
                                                    columnNumber: 46
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                            lineNumber: 828,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                        lineNumber: 827,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuContent"], {
                                        className: "bg-neutral-900 border-neutral-800 text-neutral-200 min-w-[200px]",
                                        children: [
                                            onRestore && restoreParentName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                                                        onClick: onRestore,
                                                        className: "text-xs focus:bg-amber-500/20 focus:text-amber-400 cursor-pointer text-amber-500 font-semibold",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                                                className: "w-3.5 h-3.5 mr-2"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                                lineNumber: 843,
                                                                columnNumber: 41
                                                            }, this),
                                                            "Restore to ",
                                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDisplayName"])(restoreParentName)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                        lineNumber: 839,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuSeparator"], {
                                                        className: "bg-neutral-800"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                        lineNumber: 846,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuLabel"], {
                                                className: "text-[10px] uppercase text-neutral-500 font-bold",
                                                children: "Select Main Group"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                lineNumber: 849,
                                                columnNumber: 29
                                            }, this),
                                            mainGroupOrder.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                                                disabled: true,
                                                className: "text-xs text-neutral-600",
                                                children: "No Main Groups"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                lineNumber: 851,
                                                columnNumber: 33
                                            }, this) : mainGroupOrder.map((uuid)=>{
                                                const name = mainCatalogGroups[uuid]?.name || "Unnamed Group";
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                                                    onClick: ()=>assignCatalogGroup(groupName, uuid),
                                                    className: "text-xs focus:bg-blue-500/20 focus:text-blue-400 cursor-pointer",
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDisplayName"])(name)
                                                }, uuid, false, {
                                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                    lineNumber: 856,
                                                    columnNumber: 41
                                                }, this);
                                            })
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                        lineNumber: 836,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                lineNumber: 826,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                variant: "ghost",
                                size: "sm",
                                onClick: ()=>setIsExpanded(!isExpanded),
                                className: `h-7 px-2 text-[10px] font-semibold uppercase tracking-tight flex items-center gap-1 rounded-md transition-colors ${isExpanded ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-white hover:bg-neutral-800'}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panels$2d$top$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layout$3e$__["Layout"], {
                                        className: "w-3.5 h-3.5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                        lineNumber: 875,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "hidden md:inline",
                                        children: "Edit"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                        lineNumber: 876,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                lineNumber: 869,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialog"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogTrigger"], {
                                        asChild: true,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: "ghost",
                                            size: "icon",
                                            className: "h-7 w-7 p-0 flex items-center justify-center text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors rounded-md border border-transparent hover:border-red-500/30",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                className: "w-3.5 h-3.5"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                lineNumber: 882,
                                                columnNumber: 33
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                            lineNumber: 881,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                        lineNumber: 880,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogContent"], {
                                        className: "bg-neutral-900 border-neutral-800 text-neutral-100",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogHeader"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogTitle"], {
                                                        children: "Delete Subgroup?"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                        lineNumber: 887,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogDescription"], {
                                                        className: "text-neutral-400",
                                                        children: [
                                                            "This will completely delete ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-white font-bold",
                                                                children: [
                                                                    '"',
                                                                    groupName,
                                                                    '"'
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                                lineNumber: 889,
                                                                columnNumber: 65
                                                            }, this),
                                                            " from the configuration. This action cannot be undone."
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                        lineNumber: 888,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                lineNumber: 886,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogFooter"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogCancel"], {
                                                        className: "bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white",
                                                        children: "Cancel"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                        lineNumber: 893,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogAction"], {
                                                        onClick: ()=>removeCatalogGroup(groupName),
                                                        className: "bg-red-600 text-white hover:bg-red-700 font-bold",
                                                        children: "Delete Subgroup"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                        lineNumber: 894,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                lineNumber: 892,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                        lineNumber: 885,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                lineNumber: 879,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                        lineNumber: 825,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                lineNumber: 814,
                columnNumber: 13
            }, this),
            isExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-t border-neutral-800 bg-neutral-950",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-1 mb-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DndContext"], {
                            sensors: catalogSensors,
                            collisionDetection: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["closestCenter"],
                            onDragEnd: handleInternalDragEnd,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SortableContext"], {
                                items: subgroupCatalogsProp,
                                strategy: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["verticalListSortingStrategy"],
                                children: subgroupCatalogsProp.map((catId)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortableCatalogNode, {
                                        id: catId,
                                        onRemove: ()=>handleRemoveCatalog(catId)
                                    }, catId, false, {
                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                        lineNumber: 912,
                                        columnNumber: 37
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                lineNumber: 910,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                            lineNumber: 909,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                        lineNumber: 908,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-3",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenu"], {
                            open: isAddMenuOpen,
                            onOpenChange: (open)=>{
                                setIsAddMenuOpen(open);
                                if (!open) setCatalogSearch("");
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuTrigger"], {
                                    asChild: true,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        size: "sm",
                                        variant: "outline",
                                        className: "w-full justify-start text-xs border border-dashed border-neutral-700/60 bg-neutral-950/30 text-neutral-400 hover:text-white hover:bg-neutral-800/80 hover:border-neutral-600 transition-colors",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                className: "w-3.5 h-3.5 mr-2"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                lineNumber: 930,
                                                columnNumber: 37
                                            }, this),
                                            " Add Catalog..."
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                        lineNumber: 929,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                    lineNumber: 928,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuContent"], {
                                    className: "w-80 bg-neutral-900 border-neutral-800 text-neutral-200 shadow-2xl p-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-3 border-b border-neutral-800 bg-neutral-950 space-y-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                    className: "text-[10px] uppercase font-bold text-neutral-500 flex justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "Select Catalog"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                            lineNumber: 936,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-neutral-600",
                                                            children: [
                                                                filteredCatalogs.length,
                                                                " available"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                            lineNumber: 937,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                    lineNumber: 935,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "relative",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                            className: "absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-500"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                            lineNumber: 940,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                            placeholder: "Search by name or ID...",
                                                            value: catalogSearch,
                                                            onChange: (e)=>setCatalogSearch(e.target.value),
                                                            className: "h-7 text-[11px] pl-7 bg-neutral-900 border-neutral-800 focus-visible:ring-blue-600",
                                                            autoFocus: true,
                                                            onKeyDown: (e)=>e.stopPropagation()
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                            lineNumber: 941,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                    lineNumber: 939,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                            lineNumber: 934,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "max-h-[320px] overflow-y-auto p-1 pt-0 custom-scrollbar",
                                            children: filteredCatalogs.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[10px] text-neutral-600 p-4 text-center",
                                                children: "No catalogs found."
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                lineNumber: 953,
                                                columnNumber: 41
                                            }, this) : (()=>{
                                                const groups = {
                                                    "Other": []
                                                };
                                                filteredCatalogs.forEach((c)=>{
                                                    const match = c.name.match(/^\[(.*?)\]\s*(.*)$/);
                                                    if (match) {
                                                        const category = match[1];
                                                        const cleanName = match[2];
                                                        if (!groups[category]) groups[category] = [];
                                                        groups[category].push({
                                                            ...c,
                                                            name: cleanName
                                                        });
                                                    } else {
                                                        groups["Other"].push(c);
                                                    }
                                                });
                                                const sortedCategories = Object.keys(groups).filter((k)=>k !== "Other").sort((a, b)=>a.localeCompare(b));
                                                if (groups["Other"].length > 0) {
                                                    sortedCategories.push("Other");
                                                }
                                                return sortedCategories.map((category)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mb-2 last:mb-0",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "sticky top-0 bg-neutral-900 py-1.5 px-3 z-[60] border-b border-neutral-800/80 mb-1 -mx-1",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                                                                    className: "text-[10px] font-bold text-blue-400 uppercase tracking-wider",
                                                                    children: category
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                                    lineNumber: 982,
                                                                    columnNumber: 57
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                                lineNumber: 981,
                                                                columnNumber: 53
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex flex-col gap-0.5 px-1",
                                                                children: groups[category].map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                                                                        onSelect: (e)=>handleAddCatalog(e, c.id),
                                                                        className: "flex items-start gap-2 p-2 rounded cursor-pointer focus:bg-blue-500/10 focus:text-blue-400",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex-1 min-w-0",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                    className: "text-sm font-medium truncate",
                                                                                    children: c.name
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                                                    lineNumber: 992,
                                                                                    columnNumber: 69
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                    className: "text-[9px] text-neutral-500 font-mono truncate",
                                                                                    children: c.id
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                                                    lineNumber: 993,
                                                                                    columnNumber: 69
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                                            lineNumber: 991,
                                                                            columnNumber: 65
                                                                        }, this)
                                                                    }, c.id, false, {
                                                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                                        lineNumber: 986,
                                                                        columnNumber: 61
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                                lineNumber: 984,
                                                                columnNumber: 53
                                                            }, this)
                                                        ]
                                                    }, category, true, {
                                                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                                        lineNumber: 980,
                                                        columnNumber: 49
                                                    }, this));
                                            })()
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                            lineNumber: 951,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                    lineNumber: 933,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                            lineNumber: 924,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                        lineNumber: 923,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                lineNumber: 907,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
        lineNumber: 813,
        columnNumber: 9
    }, this);
}
_s3(UnassignedSubgroupRow, "QjceBIkaY8o/O4ZKFjaWi3QmmYk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ConfigContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useConfig"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSensors"]
    ];
});
_c3 = UnassignedSubgroupRow;
function UnifiedSubgroupEditor() {
    _s4();
    const { currentValues, updateValue, assignCatalogGroup, catalogs: manifestCatalogs, addManifestCatalog } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ConfigContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useConfig"])();
    const subgroupOrder = currentValues["subgroup_order"] || {};
    const mainCatalogGroups = currentValues["main_catalog_groups"] || {};
    const mainGroupOrderFromConfig = currentValues["main_group_order"] || [];
    const [mainGroupOrder, setMainGroupOrder] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(mainGroupOrderFromConfig);
    const [isCreateModalOpen, setIsCreateModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [createParentUUID, setCreateParentUUID] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])();
    const [isAddToGroupModalOpen, setIsAddToGroupModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isImportModalOpen, setIsImportModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [recentUnassigns, setRecentUnassigns] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({}); // subgroupName -> parentUuid
    const handleUnassignSubgroup = (subgroupName, parentUuid)=>{
        setRecentUnassigns((prev)=>({
                ...prev,
                [subgroupName]: parentUuid
            }));
    };
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "UnifiedSubgroupEditor.useEffect": ()=>{
            setMainGroupOrder(mainGroupOrderFromConfig);
        }
    }["UnifiedSubgroupEditor.useEffect"], [
        JSON.stringify(mainGroupOrderFromConfig)
    ]);
    const sensors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSensors"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSensor"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PointerSensor"]), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSensor"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KeyboardSensor"], {
        coordinateGetter: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sortableKeyboardCoordinates"]
    }));
    const handleMainDragEnd = (event)=>{
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = mainGroupOrder.indexOf(active.id);
            const newIndex = mainGroupOrder.indexOf(over.id);
            const newArray = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayMove"])(mainGroupOrder, oldIndex, newIndex);
            setMainGroupOrder(newArray);
            updateValue([
                "main_group_order"
            ], newArray);
        }
    };
    // Filter unassigned subgroups
    const catalogGroups = currentValues.catalog_groups || {};
    const assignedGroups = new Set();
    // Check subgroup_order (uuid → string[])
    Object.values(subgroupOrder).forEach((arr)=>{
        if (Array.isArray(arr)) arr.forEach((name)=>assignedGroups.add(name));
    });
    // Also check main_catalog_groups[uuid].subgroupNames
    Object.values(mainCatalogGroups).forEach((group)=>{
        if (Array.isArray(group?.subgroupNames)) {
            group.subgroupNames.forEach((name)=>assignedGroups.add(name));
        }
    });
    // Exclude: already assigned, OR name looks like a [Placeholder], or contains exclamation mark emojis
    const isPlaceholder = (name)=>{
        const n = name.trim();
        return n.includes("❗️") || n.includes("❗") || /\[.+\]/.test(n);
    };
    const unassignedGroups = Object.keys(catalogGroups).filter((name)=>!assignedGroups.has(name) && !isPlaceholder(name));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-center mb-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-wrap gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: ()=>setIsCreateModalOpen(true),
                            className: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                    className: "w-5 h-5 mr-2"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                    lineNumber: 1088,
                                    columnNumber: 25
                                }, this),
                                "Create New Group"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                            lineNumber: 1084,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: ()=>setIsAddToGroupModalOpen(true),
                            className: "bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 shadow-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderPlus$3e$__["FolderPlus"], {
                                    className: "w-5 h-5 mr-2"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                    lineNumber: 1095,
                                    columnNumber: 25
                                }, this),
                                "Add to Group"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                            lineNumber: 1091,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: ()=>setIsImportModalOpen(true),
                            className: "bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 shadow-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UploadCloud$3e$__["UploadCloud"], {
                                    className: "w-5 h-5 mr-2"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                    lineNumber: 1102,
                                    columnNumber: 25
                                }, this),
                                "Update from Template"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                            lineNumber: 1098,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                    lineNumber: 1083,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                lineNumber: 1082,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$editor$2f$CreateGroupModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CreateGroupModal"], {
                isOpen: isCreateModalOpen,
                onClose: ()=>{
                    setIsCreateModalOpen(false);
                    setCreateParentUUID(undefined);
                },
                initialParentUUID: createParentUUID
            }, void 0, false, {
                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                lineNumber: 1109,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$editor$2f$AddToGroupModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AddToGroupModal"], {
                isOpen: isAddToGroupModalOpen,
                onClose: ()=>setIsAddToGroupModalOpen(false)
            }, void 0, false, {
                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                lineNumber: 1117,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$editor$2f$ImportSetupModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ImportSetupModal"], {
                isOpen: isImportModalOpen,
                onClose: ()=>setIsImportModalOpen(false)
            }, void 0, false, {
                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                lineNumber: 1118,
                columnNumber: 13
            }, this),
            mainGroupOrder.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center py-12 border border-dashed border-neutral-800/80 rounded-2xl bg-neutral-950/20 flex flex-col items-center justify-center gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 bg-blue-500/10 rounded-full border border-blue-500/20",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderPlus$3e$__["FolderPlus"], {
                            className: "w-8 h-8 text-blue-500/60"
                        }, void 0, false, {
                            fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                            lineNumber: 1123,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                        lineNumber: 1122,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-bold text-neutral-300",
                                children: "No Main Groups Found"
                            }, void 0, false, {
                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                lineNumber: 1126,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-neutral-500 max-w-[280px] leading-relaxed mx-auto",
                                children: "Start by creating a new group or add existing subgroups from the library below."
                            }, void 0, false, {
                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                lineNumber: 1127,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                        lineNumber: 1125,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                lineNumber: 1121,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DndContext"], {
                sensors: sensors,
                collisionDetection: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["closestCenter"],
                onDragEnd: handleMainDragEnd,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SortableContext"], {
                    items: mainGroupOrder,
                    strategy: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["verticalListSortingStrategy"],
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Accordion"], {
                        type: "single",
                        collapsible: true,
                        className: "w-full space-y-4",
                        children: mainGroupOrder.map((uuid)=>{
                            const name = mainCatalogGroups[uuid]?.name || `Group ${uuid.slice(0, 4)}`;
                            const subgroupNames = subgroupOrder[uuid] || [];
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MainGroupNode, {
                                uuid: uuid,
                                name: name,
                                subgroupNames: subgroupNames,
                                onUnassignSubgroup: handleUnassignSubgroup,
                                onAddSubgroup: (id)=>{
                                    setCreateParentUUID(id);
                                    setIsCreateModalOpen(true);
                                }
                            }, uuid, false, {
                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                lineNumber: 1141,
                                columnNumber: 33
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                        lineNumber: 1136,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                    lineNumber: 1135,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                lineNumber: 1134,
                columnNumber: 13
            }, this),
            unassignedGroups.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-12 border-t border-neutral-800 pt-8 pb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-bold text-amber-500",
                                children: "Unassigned Subgroups"
                            }, void 0, false, {
                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                lineNumber: 1161,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-neutral-500",
                                children: "Subgroups that are defined but not yet linked to any main group."
                            }, void 0, false, {
                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                lineNumber: 1162,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                        lineNumber: 1160,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col",
                        children: unassignedGroups.map((name)=>{
                            const restoreParentUuid = recentUnassigns[name];
                            const restoreParentName = restoreParentUuid ? mainCatalogGroups[restoreParentUuid]?.name || "Original Group" : undefined;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(UnassignedSubgroupRow, {
                                groupName: name,
                                catalogs: catalogGroups[name] || [],
                                onRestore: restoreParentUuid ? ()=>{
                                    assignCatalogGroup(name, restoreParentUuid);
                                    setRecentUnassigns((prev)=>{
                                        const next = {
                                            ...prev
                                        };
                                        delete next[name];
                                        return next;
                                    });
                                } : undefined,
                                restoreParentName: restoreParentName
                            }, name, false, {
                                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                                lineNumber: 1170,
                                columnNumber: 33
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                        lineNumber: 1164,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                lineNumber: 1159,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$editor$2f$TrashBin$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TrashBin"], {}, void 0, false, {
                fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
                lineNumber: 1190,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/editor/UnifiedSubgroupEditor.tsx",
        lineNumber: 1081,
        columnNumber: 9
    }, this);
}
_s4(UnifiedSubgroupEditor, "qNdTjiqFWmXgRs3IYp2GUszNyAw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ConfigContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useConfig"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSensors"]
    ];
});
_c4 = UnifiedSubgroupEditor;
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "SortableCatalogNode");
__turbopack_context__.k.register(_c1, "SortableSubgroupNode");
__turbopack_context__.k.register(_c2, "MainGroupNode");
__turbopack_context__.k.register(_c3, "UnassignedSubgroupRow");
__turbopack_context__.k.register(_c4, "UnifiedSubgroupEditor");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_components_editor_UnifiedSubgroupEditor_tsx_ca8283b7._.js.map