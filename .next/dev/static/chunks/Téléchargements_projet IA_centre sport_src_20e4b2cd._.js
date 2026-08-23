(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Téléchargements/projet IA/centre sport/src/contexts/ThemeContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>ThemeProvider,
    "useTheme",
    ()=>useTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Téléchargements/projet IA/centre sport/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Téléchargements/projet IA/centre sport/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
const initialState = {
    theme: "system",
    setTheme: ()=>null
};
const ThemeContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(initialState);
function ThemeProvider({ children, defaultTheme = "system", storageKey = "sport-center-theme", ...props }) {
    _s();
    const [theme, setTheme] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(defaultTheme);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ThemeProvider.useEffect": ()=>{
            const stored = localStorage.getItem(storageKey);
            if (stored) setTheme(stored);
        }
    }["ThemeProvider.useEffect"], [
        storageKey
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ThemeProvider.useEffect": ()=>{
            const root = window.document.documentElement;
            root.classList.remove("light", "dark");
            if (theme === "system") {
                const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                root.classList.add(systemTheme);
                return;
            }
            root.classList.add(theme);
        }
    }["ThemeProvider.useEffect"], [
        theme
    ]);
    const value = {
        theme,
        setTheme: (theme)=>{
            localStorage.setItem(storageKey, theme);
            setTheme(theme);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ThemeContext.Provider, {
        ...props,
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/Téléchargements/projet IA/centre sport/src/contexts/ThemeContext.tsx",
        lineNumber: 64,
        columnNumber: 5
    }, this);
}
_s(ThemeProvider, "W8D4/Q1J7zkRqv7jhld4gmhU6go=");
_c = ThemeProvider;
const useTheme = ()=>{
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(ThemeContext);
    if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");
    return context;
};
_s1(useTheme, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "ThemeProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Téléchargements/projet IA/centre sport/src/utils/cn.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Téléchargements/projet IA/centre sport/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Téléchargements/projet IA/centre sport/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Téléchargements/projet IA/centre sport/src/components/ui/Button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Téléchargements/projet IA/centre sport/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Téléchargements/projet IA/centre sport/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$src$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Téléchargements/projet IA/centre sport/src/utils/cn.ts [app-client] (ecmascript)");
;
;
;
const Button = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forwardRef(_c = ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref)=>{
    const variants = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm',
        secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 shadow-sm',
        outline: 'border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
        ghost: 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
        danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
    };
    const sizes = {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2 text-sm',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10 p-2'
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$src$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50', variants[variant], sizes[size], className),
        disabled: isLoading || props.disabled,
        ...props,
        children: [
            isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                className: "mr-2 h-4 w-4 animate-spin",
                viewBox: "0 0 24 24",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                        className: "opacity-25",
                        cx: "12",
                        cy: "12",
                        r: "10",
                        stroke: "currentColor",
                        strokeWidth: "4",
                        fill: "none"
                    }, void 0, false, {
                        fileName: "[project]/Téléchargements/projet IA/centre sport/src/components/ui/Button.tsx",
                        lineNumber: 41,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        className: "opacity-75",
                        fill: "currentColor",
                        d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    }, void 0, false, {
                        fileName: "[project]/Téléchargements/projet IA/centre sport/src/components/ui/Button.tsx",
                        lineNumber: 42,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/Téléchargements/projet IA/centre sport/src/components/ui/Button.tsx",
                lineNumber: 40,
                columnNumber: 11
            }, ("TURBOPACK compile-time value", void 0)) : null,
            children
        ]
    }, void 0, true, {
        fileName: "[project]/Téléchargements/projet IA/centre sport/src/components/ui/Button.tsx",
        lineNumber: 28,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = Button;
Button.displayName = 'Button';
var _c, _c1;
__turbopack_context__.k.register(_c, "Button$React.forwardRef");
__turbopack_context__.k.register(_c1, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Téléchargements/projet IA/centre sport/src/components/ui/Toast.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Toast",
    ()=>Toast,
    "ToastContainer",
    ()=>ToastContainer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Téléchargements/projet IA/centre sport/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Téléchargements/projet IA/centre sport/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/Téléchargements/projet IA/centre sport/node_modules/lucide-react/dist/esm/icons/x.mjs [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/Téléchargements/projet IA/centre sport/node_modules/lucide-react/dist/esm/icons/circle-check-big.mjs [app-client] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/Téléchargements/projet IA/centre sport/node_modules/lucide-react/dist/esm/icons/circle-alert.mjs [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/Téléchargements/projet IA/centre sport/node_modules/lucide-react/dist/esm/icons/info.mjs [app-client] (ecmascript) <export default as Info>");
var __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$src$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Téléchargements/projet IA/centre sport/src/utils/cn.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Téléchargements/projet IA/centre sport/src/components/ui/Button.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
function Toast({ id, message, type = 'info', duration = 3000, onClose }) {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Toast.useEffect": ()=>{
            if (duration > 0) {
                const timer = setTimeout({
                    "Toast.useEffect.timer": ()=>{
                        onClose(id);
                    }
                }["Toast.useEffect.timer"], duration);
                return ({
                    "Toast.useEffect": ()=>clearTimeout(timer)
                })["Toast.useEffect"];
            }
        }
    }["Toast.useEffect"], [
        duration,
        id,
        onClose
    ]);
    const icons = {
        success: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
            className: "h-5 w-5 text-green-500"
        }, void 0, false, {
            fileName: "[project]/Téléchargements/projet IA/centre sport/src/components/ui/Toast.tsx",
            lineNumber: 27,
            columnNumber: 14
        }, this),
        error: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
            className: "h-5 w-5 text-red-500"
        }, void 0, false, {
            fileName: "[project]/Téléchargements/projet IA/centre sport/src/components/ui/Toast.tsx",
            lineNumber: 28,
            columnNumber: 12
        }, this),
        info: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"], {
            className: "h-5 w-5 text-blue-500"
        }, void 0, false, {
            fileName: "[project]/Téléchargements/projet IA/centre sport/src/components/ui/Toast.tsx",
            lineNumber: 29,
            columnNumber: 11
        }, this)
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$src$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("pointer-events-auto flex w-full max-w-sm items-center space-x-4 rounded-lg bg-white p-4 shadow-lg ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10 transition-all"),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-shrink-0",
                children: icons[type]
            }, void 0, false, {
                fileName: "[project]/Téléchargements/projet IA/centre sport/src/components/ui/Toast.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 text-sm font-medium text-slate-900 dark:text-slate-50",
                children: message
            }, void 0, false, {
                fileName: "[project]/Téléchargements/projet IA/centre sport/src/components/ui/Toast.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-shrink-0",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                    variant: "ghost",
                    size: "icon",
                    onClick: ()=>onClose(id),
                    className: "h-6 w-6",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                        className: "h-4 w-4"
                    }, void 0, false, {
                        fileName: "[project]/Téléchargements/projet IA/centre sport/src/components/ui/Toast.tsx",
                        lineNumber: 44,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Téléchargements/projet IA/centre sport/src/components/ui/Toast.tsx",
                    lineNumber: 43,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Téléchargements/projet IA/centre sport/src/components/ui/Toast.tsx",
                lineNumber: 42,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Téléchargements/projet IA/centre sport/src/components/ui/Toast.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
_s(Toast, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = Toast;
function ToastContainer({ toasts, onClose }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-6 pointer-events-none",
        children: toasts.map((toast)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Toast, {
                ...toast,
                onClose: onClose
            }, toast.id, false, {
                fileName: "[project]/Téléchargements/projet IA/centre sport/src/components/ui/Toast.tsx",
                lineNumber: 56,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/Téléchargements/projet IA/centre sport/src/components/ui/Toast.tsx",
        lineNumber: 54,
        columnNumber: 5
    }, this);
}
_c1 = ToastContainer;
var _c, _c1;
__turbopack_context__.k.register(_c, "Toast");
__turbopack_context__.k.register(_c1, "ToastContainer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Téléchargements/projet IA/centre sport/src/contexts/ToastContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ToastProvider",
    ()=>ToastProvider,
    "useToast",
    ()=>useToast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Téléchargements/projet IA/centre sport/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Téléchargements/projet IA/centre sport/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$src$2f$components$2f$ui$2f$Toast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Téléchargements/projet IA/centre sport/src/components/ui/Toast.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
const ToastContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function ToastProvider({ children }) {
    _s();
    const [toasts, setToasts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const addToast = (message, type = "info", duration = 3000)=>{
        const id = String(Date.now()) + Math.random().toString(36).slice(2, 9);
        setToasts((t)=>[
                {
                    id,
                    message,
                    type,
                    duration
                },
                ...t
            ]);
        return id;
    };
    const removeToast = (id)=>setToasts((t)=>t.filter((x)=>x.id !== id));
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ToastProvider.useMemo[value]": ()=>({
                toasts,
                addToast,
                removeToast
            })
    }["ToastProvider.useMemo[value]"], [
        toasts
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ToastContext.Provider, {
        value: value,
        children: [
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$src$2f$components$2f$ui$2f$Toast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToastContainer"], {
                toasts: toasts.map((t)=>({
                        id: t.id,
                        message: t.message,
                        type: t.type,
                        duration: t.duration
                    })),
                onClose: removeToast
            }, void 0, false, {
                fileName: "[project]/Téléchargements/projet IA/centre sport/src/contexts/ToastContext.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Téléchargements/projet IA/centre sport/src/contexts/ToastContext.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
}
_s(ToastProvider, "sYXTYLpBVp9NvoXCceEeu8oaLhI=");
_c = ToastProvider;
function useToast() {
    _s1();
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
}
_s1(useToast, "/dMy7t63NXD4eYACoT93CePwGrg=");
var _c;
__turbopack_context__.k.register(_c, "ToastProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Téléchargements/projet IA/centre sport/src/services/dbService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DB_KEYS_EXPORT",
    ()=>DB_KEYS_EXPORT,
    "activitiesDB",
    ()=>activitiesDB,
    "db",
    ()=>db,
    "paymentProvidersDB",
    ()=>paymentProvidersDB,
    "paymentsDB",
    ()=>paymentsDB,
    "placesDB",
    ()=>placesDB,
    "plansDB",
    ()=>plansDB,
    "productsDB",
    ()=>productsDB,
    "receiptsDB",
    ()=>receiptsDB,
    "reservationsDB",
    ()=>reservationsDB,
    "statsDB",
    ()=>statsDB,
    "subscriptionRequestsDB",
    ()=>subscriptionRequestsDB,
    "subscriptionsDB",
    ()=>subscriptionsDB,
    "timeSlotsDB",
    ()=>timeSlotsDB,
    "trainersDB",
    ()=>trainersDB,
    "usersDB",
    ()=>usersDB
]);
"use client";
// ============================================================
// SERVICE DE BASE DE DONNÉES LOCAL (localStorage)
// Synchronise les données entre l'admin et le reste du site
// ============================================================
const initialUsers = [];
const DB_KEYS = {
    activities: "db_activities",
    trainers: "db_trainers",
    places: "db_places",
    plans: "db_plans",
    subscriptions: "db_subscriptions",
    products: "db_products",
    subscriptionRequests: "db_subscription_requests",
    payments: "db_payments",
    paymentProviders: "db_payment_providers",
    reservations: "db_reservations",
    timeSlots: "db_time_slots",
    receipts: "db_receipts",
    users: "db_users",
    stats: "db_stats"
};
const SEED_VERSION = "3";
const isBrowser = ()=>("TURBOPACK compile-time value", "object") !== "undefined";
const initializeDB = ()=>{
    if (!isBrowser()) //TURBOPACK unreachable
    ;
    if (localStorage.getItem("db_seed_version") !== SEED_VERSION) {
        Object.values(DB_KEYS).forEach((key)=>localStorage.removeItem(key));
        localStorage.setItem("db_seed_version", SEED_VERSION);
    }
    if (!localStorage.getItem(DB_KEYS.activities)) {
        localStorage.setItem(DB_KEYS.activities, "[]");
    }
    if (!localStorage.getItem(DB_KEYS.trainers)) {
        localStorage.setItem(DB_KEYS.trainers, "[]");
    }
    if (!localStorage.getItem(DB_KEYS.places)) {
        localStorage.setItem(DB_KEYS.places, "[]");
    }
    if (!localStorage.getItem(DB_KEYS.plans)) {
        localStorage.setItem(DB_KEYS.plans, "[]");
    }
    if (!localStorage.getItem(DB_KEYS.subscriptions)) {
        localStorage.setItem(DB_KEYS.subscriptions, "[]");
    }
    if (!localStorage.getItem(DB_KEYS.products)) {
        localStorage.setItem(DB_KEYS.products, "[]");
    }
    if (!localStorage.getItem(DB_KEYS.subscriptionRequests)) {
        localStorage.setItem(DB_KEYS.subscriptionRequests, "[]");
    }
    if (!localStorage.getItem(DB_KEYS.payments)) {
        localStorage.setItem(DB_KEYS.payments, "[]");
    }
    if (!localStorage.getItem(DB_KEYS.paymentProviders)) {
        localStorage.setItem(DB_KEYS.paymentProviders, "[]");
    }
    if (!localStorage.getItem(DB_KEYS.reservations)) {
        localStorage.setItem(DB_KEYS.reservations, "[]");
    }
    if (!localStorage.getItem(DB_KEYS.timeSlots)) {
        localStorage.setItem(DB_KEYS.timeSlots, "[]");
    }
    if (!localStorage.getItem(DB_KEYS.receipts)) {
        localStorage.setItem(DB_KEYS.receipts, "[]");
    }
    if (!localStorage.getItem(DB_KEYS.users)) {
        localStorage.setItem(DB_KEYS.users, JSON.stringify(initialUsers));
    }
    try {
        const rawUsers = localStorage.getItem(DB_KEYS.users) || "[]";
        const parsedUsers = JSON.parse(rawUsers);
        const hasAdmin = parsedUsers.some((u)=>u.email && u.email.toLowerCase() === "admin@gmail.com");
        if (!hasAdmin) {
            const newAdmin = {
                id: generateId(parsedUsers),
                name: "Administrateur",
                email: "admin@gmail.com",
                password: "password",
                role: "Gestionnaire",
                lastLogin: null
            };
            parsedUsers.push(newAdmin);
            localStorage.setItem(DB_KEYS.users, JSON.stringify(parsedUsers));
        }
    } catch (e) {
    // ignore
    }
    if (!localStorage.getItem(DB_KEYS.stats)) {
        localStorage.setItem(DB_KEYS.stats, JSON.stringify({}));
    }
};
const generateId = (items)=>{
    return items.length > 0 ? Math.max(...items.map((i)=>i.id)) + 1 : 1;
};
const db = {
    getAll (key) {
        if (!isBrowser()) //TURBOPACK unreachable
        ;
        initializeDB();
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    },
    getById (key, id) {
        const items = this.getAll(key);
        return items.find((item)=>item.id === id);
    },
    create (key, data) {
        if (!isBrowser()) //TURBOPACK unreachable
        ;
        const items = this.getAll(key);
        const newItem = {
            ...data,
            id: generateId(items)
        };
        items.push(newItem);
        localStorage.setItem(key, JSON.stringify(items));
        this.notifyChange(key);
        return newItem;
    },
    update (key, id, data) {
        if (!isBrowser()) //TURBOPACK unreachable
        ;
        const items = this.getAll(key);
        const index = items.findIndex((item)=>item.id === id);
        if (index === -1) return undefined;
        items[index] = {
            ...items[index],
            ...data
        };
        localStorage.setItem(key, JSON.stringify(items));
        this.notifyChange(key);
        return items[index];
    },
    delete (key, id) {
        if (!isBrowser()) //TURBOPACK unreachable
        ;
        const items = this.getAll(key);
        const filtered = items.filter((item)=>item.id !== id);
        if (filtered.length === items.length) return false;
        localStorage.setItem(key, JSON.stringify(filtered));
        this.notifyChange(key);
        return true;
    },
    setAll (key, items) {
        if (!isBrowser()) //TURBOPACK unreachable
        ;
        localStorage.setItem(key, JSON.stringify(items));
        this.notifyChange(key);
    },
    subscribe (callback) {
        if (!isBrowser()) //TURBOPACK unreachable
        ;
        window.addEventListener("storage", callback);
        return ()=>window.removeEventListener("storage", callback);
    },
    notifyChange (key) {
        if (!isBrowser()) //TURBOPACK unreachable
        ;
        window.dispatchEvent(new CustomEvent("db-change", {
            detail: {
                key
            }
        }));
    },
    reset () {
        if (!isBrowser()) //TURBOPACK unreachable
        ;
        Object.values(DB_KEYS).forEach((key)=>localStorage.removeItem(key));
        initializeDB();
        this.notifyChange("reset");
    }
};
const activitiesDB = {
    getAll: ()=>db.getAll(DB_KEYS.activities),
    getById: (id)=>db.getById(DB_KEYS.activities, id),
    create: (data)=>db.create(DB_KEYS.activities, data),
    update: (id, data)=>db.update(DB_KEYS.activities, id, data),
    delete: (id)=>db.delete(DB_KEYS.activities, id)
};
const trainersDB = {
    getAll: ()=>db.getAll(DB_KEYS.trainers),
    getById: (id)=>db.getById(DB_KEYS.trainers, id),
    create: (data)=>db.create(DB_KEYS.trainers, data),
    update: (id, data)=>db.update(DB_KEYS.trainers, id, data),
    delete: (id)=>db.delete(DB_KEYS.trainers, id)
};
const placesDB = {
    getAll: ()=>db.getAll(DB_KEYS.places),
    getById: (id)=>db.getById(DB_KEYS.places, id),
    create: (data)=>db.create(DB_KEYS.places, data),
    update: (id, data)=>db.update(DB_KEYS.places, id, data),
    delete: (id)=>db.delete(DB_KEYS.places, id)
};
const plansDB = {
    getAll: ()=>db.getAll(DB_KEYS.plans),
    getById: (id)=>{
        const items = db.getAll(DB_KEYS.plans);
        return items.find((item)=>item.id === id);
    },
    create: (data)=>db.create(DB_KEYS.plans, data),
    update: (id, data)=>{
        if (!isBrowser()) //TURBOPACK unreachable
        ;
        const items = db.getAll(DB_KEYS.plans);
        const index = items.findIndex((item)=>item.id === id);
        if (index === -1) return undefined;
        items[index] = {
            ...items[index],
            ...data
        };
        localStorage.setItem(DB_KEYS.plans, JSON.stringify(items));
        db.notifyChange(DB_KEYS.plans);
        return items[index];
    },
    delete: (id)=>{
        if (!isBrowser()) //TURBOPACK unreachable
        ;
        const items = db.getAll(DB_KEYS.plans);
        const filtered = items.filter((item)=>item.id !== id);
        if (filtered.length === items.length) return false;
        localStorage.setItem(DB_KEYS.plans, JSON.stringify(filtered));
        db.notifyChange(DB_KEYS.plans);
        return true;
    }
};
const subscriptionsDB = {
    getAll: ()=>db.getAll(DB_KEYS.subscriptions),
    getById: (id)=>db.getById(DB_KEYS.subscriptions, id),
    create: (data)=>db.create(DB_KEYS.subscriptions, data),
    update: (id, data)=>db.update(DB_KEYS.subscriptions, id, data),
    delete: (id)=>db.delete(DB_KEYS.subscriptions, id)
};
const productsDB = {
    getAll: ()=>db.getAll(DB_KEYS.products),
    getById: (id)=>db.getById(DB_KEYS.products, id),
    create: (data)=>db.create(DB_KEYS.products, data),
    update: (id, data)=>db.update(DB_KEYS.products, id, data),
    delete: (id)=>db.delete(DB_KEYS.products, id)
};
const subscriptionRequestsDB = {
    getAll: ()=>db.getAll(DB_KEYS.subscriptionRequests),
    getById: (id)=>db.getById(DB_KEYS.subscriptionRequests, id),
    create: (data)=>db.create(DB_KEYS.subscriptionRequests, data),
    update: (id, data)=>db.update(DB_KEYS.subscriptionRequests, id, data),
    delete: (id)=>db.delete(DB_KEYS.subscriptionRequests, id)
};
const paymentsDB = {
    getAll: ()=>db.getAll(DB_KEYS.payments),
    getById: (id)=>db.getById(DB_KEYS.payments, id),
    create: (data)=>db.create(DB_KEYS.payments, data),
    update: (id, data)=>db.update(DB_KEYS.payments, id, data),
    delete: (id)=>db.delete(DB_KEYS.payments, id)
};
const paymentProvidersDB = {
    getAll: ()=>db.getAll(DB_KEYS.paymentProviders)
};
const reservationsDB = {
    getAll: ()=>db.getAll(DB_KEYS.reservations),
    getById: (id)=>db.getById(DB_KEYS.reservations, id),
    create: (data)=>db.create(DB_KEYS.reservations, data),
    update: (id, data)=>db.update(DB_KEYS.reservations, id, data),
    delete: (id)=>db.delete(DB_KEYS.reservations, id)
};
const timeSlotsDB = {
    getAll: ()=>db.getAll(DB_KEYS.timeSlots),
    setAll: (items)=>db.setAll(DB_KEYS.timeSlots, items)
};
const receiptsDB = {
    getAll: ()=>db.getAll(DB_KEYS.receipts),
    getById: (id)=>db.getById(DB_KEYS.receipts, id),
    create: (data)=>db.create(DB_KEYS.receipts, data),
    update: (id, data)=>db.update(DB_KEYS.receipts, id, data),
    delete: (id)=>db.delete(DB_KEYS.receipts, id)
};
const usersDB = {
    getAll: ()=>db.getAll(DB_KEYS.users),
    getById: (id)=>db.getById(DB_KEYS.users, id),
    create: (data)=>db.create(DB_KEYS.users, data),
    update: (id, data)=>db.update(DB_KEYS.users, id, data),
    delete: (id)=>db.delete(DB_KEYS.users, id)
};
const statsDB = {
    get: ()=>{
        if (!isBrowser()) //TURBOPACK unreachable
        ;
        initializeDB();
        const raw = localStorage.getItem(DB_KEYS.stats);
        return raw ? JSON.parse(raw) : null;
    },
    update: (data)=>{
        if (!isBrowser()) //TURBOPACK unreachable
        ;
        const current = statsDB.get() || {};
        const updated = {
            ...current,
            ...data
        };
        localStorage.setItem(DB_KEYS.stats, JSON.stringify(updated));
        db.notifyChange(DB_KEYS.stats);
        return updated;
    }
};
const DB_KEYS_EXPORT = DB_KEYS;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Téléchargements/projet IA/centre sport/src/contexts/AuthContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "default",
    ()=>__TURBOPACK__default__export__,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Téléchargements/projet IA/centre sport/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Téléchargements/projet IA/centre sport/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$src$2f$services$2f$dbService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Téléchargements/projet IA/centre sport/src/services/dbService.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const AuthProvider = ({ children })=>{
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            const email = localStorage.getItem("current_user_email");
            if (email) {
                const found = __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$src$2f$services$2f$dbService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usersDB"].getAll().find({
                    "AuthProvider.useEffect.found": (u)=>u.email?.toLowerCase() === email.toLowerCase()
                }["AuthProvider.useEffect.found"]);
                if (found) setUser(found);
            }
        }
    }["AuthProvider.useEffect"], []);
    const login = async (email, password)=>{
        return new Promise((resolve)=>{
            setTimeout(()=>{
                const found = __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$src$2f$services$2f$dbService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usersDB"].getAll().find((u)=>u.email?.toLowerCase() === email.toLowerCase() && u.password === password);
                if (!found) return resolve({
                    ok: false,
                    message: "Adresse e-mail ou mot de passe incorrect."
                });
                localStorage.setItem("current_user_email", found.email.toLowerCase());
                setUser(found);
                resolve({
                    ok: true,
                    user: found
                });
            }, 500);
        });
    };
    const logout = ()=>{
        localStorage.removeItem("current_user_email");
        setUser(null);
    };
    const value = {
        user,
        login,
        logout,
        isAdmin: !!user && user.role === "Gestionnaire"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/Téléchargements/projet IA/centre sport/src/contexts/AuthContext.tsx",
        lineNumber: 52,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0));
};
_s(AuthProvider, "5s2qRsV95gTJBmaaTh11GoxYeGE=");
_c = AuthProvider;
const useAuth = ()=>{
    _s1();
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
_s1(useAuth, "/dMy7t63NXD4eYACoT93CePwGrg=");
const __TURBOPACK__default__export__ = AuthProvider;
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Téléchargements/projet IA/centre sport/src/app/providers.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Téléchargements/projet IA/centre sport/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Téléchargements/projet IA/centre sport/node_modules/@tanstack/query-core/build/modern/queryClient.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Téléchargements/projet IA/centre sport/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Téléchargements/projet IA/centre sport/src/contexts/ThemeContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Téléchargements/projet IA/centre sport/src/contexts/ToastContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Téléchargements/projet IA/centre sport/src/contexts/AuthContext.tsx [app-client] (ecmascript)");
"use client";
;
;
;
;
;
const queryClient = new __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QueryClient"]({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 1
        }
    }
});
function Providers({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ThemeProvider"], {
        defaultTheme: "system",
        storageKey: "sport-center-theme",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QueryClientProvider"], {
            client: queryClient,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToastProvider"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$T$e9$l$e9$chargements$2f$projet__IA$2f$centre__sport$2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthProvider"], {
                    children: children
                }, void 0, false, {
                    fileName: "[project]/Téléchargements/projet IA/centre sport/src/app/providers.tsx",
                    lineNumber: 23,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/Téléchargements/projet IA/centre sport/src/app/providers.tsx",
                lineNumber: 22,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Téléchargements/projet IA/centre sport/src/app/providers.tsx",
            lineNumber: 21,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Téléchargements/projet IA/centre sport/src/app/providers.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
_c = Providers;
var _c;
__turbopack_context__.k.register(_c, "Providers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=T%C3%A9l%C3%A9chargements_projet%20IA_centre%20sport_src_20e4b2cd._.js.map