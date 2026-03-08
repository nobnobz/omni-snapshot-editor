(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/config-utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/context/ConfigContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConfigProvider",
    ()=>ConfigProvider,
    "useConfig",
    ()=>useConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/config-utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
const ConfigContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const ConfigProvider = ({ children })=>{
    _s();
    const [originalConfig, setOriginalConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [currentValues, setCurrentValues] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [disabledKeys, setDisabledKeys] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [disabledCatalogs, setDisabledCatalogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [fileName, setFileName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("omni-config.json");
    const loadConfig = (config, fn = "omni-config.json")=>{
        setOriginalConfig(config);
        setFileName(fn);
        // Decode _data base64 fields into usable objects
        const decodedValues = {};
        for (const [key, val] of Object.entries(config.values || {})){
            decodedValues[key] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decodeConfig"])(val);
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
                updateValue(keyPath, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decodeConfig"])(origVal));
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
        const encodedValues = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encodeConfig"])(clonedValues, originalConfig.values, disabledKeys);
        // Run pruning for disabled catalogs on arrays
        const finalValues = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pruneDisabledCatalogs"])(encodedValues, disabledCatalogs);
        return {
            ...originalConfig,
            values: finalValues
        };
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ConfigContext.Provider, {
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
_s(ConfigProvider, "pelajBuANxKdAUSUfKTQGBQiX9s=");
_c = ConfigProvider;
const useConfig = ()=>{
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(ConfigContext);
    if (!context) throw new Error("useConfig must be used within ConfigProvider");
    return context;
};
_s1(useConfig, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "ConfigProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ "use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch(type){
            case REACT_FRAGMENT_TYPE:
                return "Fragment";
            case REACT_PROFILER_TYPE:
                return "Profiler";
            case REACT_STRICT_MODE_TYPE:
                return "StrictMode";
            case REACT_SUSPENSE_TYPE:
                return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
                return "SuspenseList";
            case REACT_ACTIVITY_TYPE:
                return "Activity";
            case REACT_VIEW_TRANSITION_TYPE:
                return "ViewTransition";
        }
        if ("object" === typeof type) switch("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof){
            case REACT_PORTAL_TYPE:
                return "Portal";
            case REACT_CONTEXT_TYPE:
                return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
                return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
                var innerType = type.render;
                type = type.displayName;
                type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
                return type;
            case REACT_MEMO_TYPE:
                return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
                innerType = type._payload;
                type = type._init;
                try {
                    return getComponentNameFromType(type(innerType));
                } catch (x) {}
        }
        return null;
    }
    function testStringCoercion(value) {
        return "" + value;
    }
    function checkKeyStringCoercion(value) {
        try {
            testStringCoercion(value);
            var JSCompiler_inline_result = !1;
        } catch (e) {
            JSCompiler_inline_result = !0;
        }
        if (JSCompiler_inline_result) {
            JSCompiler_inline_result = console;
            var JSCompiler_temp_const = JSCompiler_inline_result.error;
            var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
            return testStringCoercion(value);
        }
    }
    function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
        try {
            var name = getComponentNameFromType(type);
            return name ? "<" + name + ">" : "<...>";
        } catch (x) {
            return "<...>";
        }
    }
    function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
    }
    function UnknownOwner() {
        return Error("react-stack-top-frame");
    }
    function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) return !1;
        }
        return void 0 !== config.key;
    }
    function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
            specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
        }
        warnAboutAccessingKey.isReactWarning = !0;
        Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: !0
        });
    }
    function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
    }
    function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            props: props,
            _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
            enumerable: !1,
            get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", {
            enumerable: !1,
            value: null
        });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: null
        });
        Object.defineProperty(type, "_debugStack", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
    }
    function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children) if (isStaticChildren) if (isArrayImpl(children)) {
            for(isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)validateChildKeys(children[isStaticChildren]);
            Object.freeze && Object.freeze(children);
        } else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
        else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
            children = getComponentNameFromType(type);
            var keys = Object.keys(config).filter(function(k) {
                return "key" !== k;
            });
            isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
            didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', isStaticChildren, children, keys, children), didWarnAboutKeySpread[children + isStaticChildren] = !0);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
            maybeKey = {};
            for(var propName in config)"key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(maybeKey, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
        return ReactElement(type, children, maybeKey, getOwner(), debugStack, debugTask);
    }
    function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
    }
    function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    var React = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
    };
    React = {
        react_stack_bottom_frame: function(callStackForError) {
            return callStackForError();
        }
    };
    var specialPropKeyWarningShown;
    var didWarnAboutElementRef = {};
    var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(React, UnknownOwner)();
    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
    var didWarnAboutKeySpread = {};
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.jsxDEV = function(type, config, maybeKey, isStaticChildren) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        if (trackActualOwner) {
            var previousStackTraceLimit = Error.stackTraceLimit;
            Error.stackTraceLimit = 10;
            var debugStackDEV = Error("react-stack-top-frame");
            Error.stackTraceLimit = previousStackTraceLimit;
        } else debugStackDEV = unknownOwnerDebugStack;
        return jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStackDEV, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
    };
}();
}),
"[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)");
}
}),
]);

//# sourceMappingURL=_dcc84ebe._.js.map