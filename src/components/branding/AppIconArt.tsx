import React from "react";

type AppIconArtProps = {
  size: number;
  maskable?: boolean;
};

export function AppIconArt({ size, maskable = false }: AppIconArtProps) {
  const outerPadding = maskable ? size * 0.08 : 0;
  const shellRadius = maskable ? size * 0.26 : size * 0.22;
  const viewBoxSize = 100;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, #0f1726 0%, #090d14 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: outerPadding,
          borderRadius: shellRadius,
          overflow: "hidden",
          background:
            "radial-gradient(circle at 22% 18%, rgba(59,130,246,0.2), transparent 34%), radial-gradient(circle at 78% 84%, rgba(245,158,11,0.12), transparent 28%), linear-gradient(180deg, rgba(17,24,39,0.98), rgba(9,13,20,0.98))",
          border: "1px solid rgba(148,163,184,0.16)",
          boxShadow:
            "0 22px 44px rgba(2,6,23,0.34), inset 0 1px 0 rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.1,
            backgroundImage:
              "linear-gradient(to right, rgba(148,163,184,0.26) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.26) 1px, transparent 1px)",
            backgroundSize: `${Math.max(10, Math.round(size * 0.11))}px ${Math.max(10, Math.round(size * 0.11))}px`,
          }}
        />

        <svg
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          width={`${maskable ? 78 : 72}%`}
          height={`${maskable ? 78 : 72}%`}
          style={{
            position: "relative",
            filter: "drop-shadow(0 10px 18px rgba(2,6,23,0.32))",
          }}
        >
          <defs>
            <linearGradient id="clownFace" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#d7dde6" />
            </linearGradient>
            <linearGradient id="clownCap" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fcd34d" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="clownFaceShadow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.26" />
            </linearGradient>
          </defs>

          <circle cx="50" cy="50" r="33" fill="rgba(59,130,246,0.18)" />
          <circle
            cx="50"
            cy="50"
            r="31"
            fill="rgba(8,13,22,0.96)"
            stroke="rgba(96,165,250,0.26)"
            strokeWidth="1.4"
          />

          <circle cx="24" cy="36" r="7" fill="#ef4444" />
          <circle cx="76" cy="36" r="7" fill="#ef4444" />

          <path
            d="M39 19c3-7 19-7 22 0-3 2-7 4-11 4s-8-2-11-4Z"
            fill="url(#clownCap)"
            stroke="#fbbf24"
            strokeWidth="1"
          />
          <circle cx="50" cy="14.5" r="2.7" fill="#fcd34d" />

          <path
            d="M50 24c10.8 0 18.5 8.4 18.5 20.2 0 11.4-7.2 21.3-18.5 24.6-11.3-3.3-18.5-13.2-18.5-24.6C31.5 32.4 39.2 24 50 24Z"
            fill="url(#clownFace)"
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />
          <path
            d="M50 24c10.8 0 18.5 8.4 18.5 20.2 0 11.4-7.2 21.3-18.5 24.6-11.3-3.3-18.5-13.2-18.5-24.6C31.5 32.4 39.2 24 50 24Z"
            fill="url(#clownFaceShadow)"
          />

          <path d="M38 37c4-4 8-6 12-6s8 2 12 6" fill="none" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="43.5" cy="42.5" r="3.1" fill="#0f172a" />
          <circle cx="56.5" cy="42.5" r="3.1" fill="#0f172a" />
          <circle cx="41" cy="52" r="2.6" fill="#fda4af" fillOpacity="0.85" />
          <circle cx="59" cy="52" r="2.6" fill="#fda4af" fillOpacity="0.85" />
          <circle cx="50" cy="49" r="5.2" fill="#dc2626" stroke="#ef4444" strokeWidth="1" />

          <path
            d="M42.5 58.5c2.8 4.2 5.6 6.4 7.5 6.4s4.7-2.2 7.5-6.4"
            fill="none"
            stroke="#991b1b"
            strokeWidth="2.3"
            strokeLinecap="round"
          />
          <path
            d="M45.5 60.5c1.8 1.6 3.3 2.5 4.5 2.5s2.7-.9 4.5-2.5"
            fill="none"
            stroke="#f87171"
            strokeWidth="1.4"
            strokeLinecap="round"
          />

          <path
            d="M35.5 33.5c-2.4 3.5-3.7 7.7-3.7 11.8 0 11.1 7.1 20.4 18.2 23.7"
            fill="none"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
