module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/lib/config-utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Utilities for decoding and encoding the _data base64 strings in the Omni Config.
 */ // Helper to check if an object is a _data wrapper
__turbopack_context__.s([
    "decodeConfig",
    ()=>decodeConfig,
    "encodeConfig",
    ()=>encodeConfig,
    "isBase64DataNode",
    ()=>isBase64DataNode,
    "pruneDisabledCatalogs",
    ()=>pruneDisabledCatalogs
]);
const isBase64DataNode = (node)=>{
    return node && typeof node === "object" && !Array.isArray(node) && Object.keys(node).length === 1 && typeof node._data === "string";
};
const decodeConfig = (obj)=>{
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) {
        return obj.map((item)=>decodeConfig(item));
    }
    if (typeof obj === "object") {
        if (isBase64DataNode(obj)) {
            try {
                const decodedStr = atob(obj._data);
                const parsed = JSON.parse(decodedStr);
                // We do not recursively decode here unless we expect nested base64 (usually not the case)
                return parsed;
            } catch (e) {
                console.error("Failed to decode or parse base64 data", obj._data, e);
                return obj; // Return original if it fails
            }
        }
        const result = {};
        for (const [key, value] of Object.entries(obj)){
            result[key] = decodeConfig(value);
        }
        return result;
    }
    return obj;
};
const encodeConfig = (currentParsedMap, originalValuesMap, disabledKeys)=>{
    const result = {};
    for (const [key, value] of Object.entries(currentParsedMap)){
        if (disabledKeys.has(key)) {
            continue; // Skip disabled keys
        }
        // Check if original was base64
        const originalValue = originalValuesMap[key];
        if (isBase64DataNode(originalValue)) {
            try {
                const stringified = JSON.stringify(value);
                const encoded = btoa(stringified);
                result[key] = {
                    _data: encoded
                };
            } catch (e) {
                console.error("Failed to encode data for key", key, e);
                result[key] = value;
            }
        } else {
            // It wasn't base64 originally, just copy it back (deep clone might be safer, but usually value is already updated)
            // Note: we should recursively prune disabled catalogs from lists here, but we will handle that in a specific pruning function.
            result[key] = value;
        }
    }
    return result;
};
const pruneDisabledCatalogs = (values, disabledCatalogs)=>{
    // Deep clone to avoid mutating state directly during export
    const cloned = JSON.parse(JSON.stringify(values));
    const pruneArray = (arr)=>arr.filter((item)=>{
            if (typeof item === 'string') {
                return !disabledCatalogs.has(item);
            }
            // If it's an object with an 'id' or something similar
            if (item && typeof item === 'object' && item.id) {
                return !disabledCatalogs.has(item.id);
            }
            return true;
        });
    // Recursive search and prune arrays
    const walkAndPrune = (obj)=>{
        if (Array.isArray(obj)) {
            return pruneArray(obj);
        }
        if (obj !== null && typeof obj === 'object') {
            for(const key in obj){
                if (Array.isArray(obj[key])) {
                    obj[key] = pruneArray(obj[key]);
                } else if (typeof obj[key] === 'object') {
                    obj[key] = walkAndPrune(obj[key]);
                }
            }
        }
        return obj;
    };
    return walkAndPrune(cloned);
};
}),
"[project]/src/context/ConfigContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConfigProvider",
    ()=>ConfigProvider,
    "useConfig",
    ()=>useConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/config-utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
const ConfigContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const ConfigProvider = ({ children })=>{
    const [originalConfig, setOriginalConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [currentValues, setCurrentValues] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [disabledKeys, setDisabledKeys] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [disabledCatalogs, setDisabledCatalogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [fileName, setFileName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("omni-config.json");
    const loadConfig = (config, fn = "omni-config.json")=>{
        setOriginalConfig(config);
        setFileName(fn);
        // Decode _data base64 fields into usable objects
        const decodedValues = {};
        for (const [key, val] of Object.entries(config.values || {})){
            decodedValues[key] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["decodeConfig"])(val);
        }
        setCurrentValues(decodedValues);
        setDisabledKeys(new Set());
        setDisabledCatalogs(new Set());
    };
    const updateValuePath = (obj, path, value)=>{
        if (path.length === 0) return value;
        if (path.length === 1) {
            if (value === undefined) {
                const newObj = {
                    ...obj
                };
                delete newObj[path[0]];
                return newObj;
            }
            return {
                ...obj,
                [path[0]]: value
            };
        }
        const [head, ...rest] = path;
        const innerObj = obj ? obj[head] : {};
        return {
            ...obj,
            [head]: updateValuePath(innerObj, rest, value)
        };
    };
    const getValuePath = (obj, path)=>{
        return path.reduce((acc, part)=>acc && acc[part] !== undefined ? acc[part] : undefined, obj);
    };
    const updateValue = (keyPath, value)=>{
        setCurrentValues((prev)=>updateValuePath(prev, keyPath, value));
    };
    const toggleKey = (keyPath, isEnabled)=>{
        const keyString = keyPath.join(".");
        setDisabledKeys((prev)=>{
            const next = new Set(prev);
            if (isEnabled) {
                next.delete(keyString);
            } else {
                next.add(keyString);
            }
            return next;
        });
        if (isEnabled && originalConfig?.values) {
            // If enabling, restore from original if it's there
            const origVal = getValuePath(originalConfig.values, keyPath);
            if (origVal !== undefined) {
                // Need to decode it just in case it was a base64 originally
                updateValue(keyPath, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["decodeConfig"])(origVal));
            }
        }
    };
    const toggleCatalog = (catalogId, isEnabled)=>{
        setDisabledCatalogs((prev)=>{
            const next = new Set(prev);
            if (isEnabled) next.delete(catalogId);
            else next.add(catalogId);
            return next;
        });
    };
    const updateCatalogsOrder = (newOrder)=>{
    // Specifically for catalogs (usually under 'catalogs' or 'selected_catalogs' array if they have a dedicated list)
    // Or we update the specific JSON key that holds the ordering.
    // In this user's json it's usually `catalog_ordering` or `selected_catalogs`.
    };
    const resetAll = ()=>{
        if (originalConfig) {
            loadConfig(originalConfig, fileName);
        }
    };
    const exportConfig = ()=>{
        if (!originalConfig) return null;
        // Deep clone current values and encode _data fields back
        const clonedValues = JSON.parse(JSON.stringify(currentValues));
        // Encode back base64 wrappers
        const encodedValues = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["encodeConfig"])(clonedValues, originalConfig.values, disabledKeys);
        // Run pruning for disabled catalogs on arrays
        const finalValues = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pruneDisabledCatalogs"])(encodedValues, disabledCatalogs);
        return {
            ...originalConfig,
            values: finalValues
        };
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ConfigContext.Provider, {
        value: {
            originalConfig,
            currentValues,
            disabledKeys,
            disabledCatalogs,
            fileName,
            isLoaded: !!originalConfig,
            loadConfig,
            updateValue,
            toggleKey,
            toggleCatalog,
            updateCatalogsOrder,
            resetAll,
            exportConfig
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/ConfigContext.tsx",
        lineNumber: 132,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
const useConfig = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(ConfigContext);
    if (!context) throw new Error("useConfig must be used within ConfigProvider");
    return context;
};
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        if ("TURBOPACK compile-time truthy", 1) {
            if ("TURBOPACK compile-time truthy", 1) {
                module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)");
            } else //TURBOPACK unreachable
            ;
        } else //TURBOPACK unreachable
        ;
    }
} //# sourceMappingURL=module.compiled.js.map
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].React; //# sourceMappingURL=react.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ce962d78._.js.map