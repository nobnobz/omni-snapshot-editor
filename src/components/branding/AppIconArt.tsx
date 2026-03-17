import React from "react";

type AppIconArtProps = {
  size: number;
  maskable?: boolean;
  imageData?: string;
};

export function AppIconArt({ size, maskable = false, imageData }: AppIconArtProps) {
  const outerPadding = maskable ? size * 0.1 : 0;
  const shellRadius = maskable ? size * 0.28 : size * 0.22;

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
        background: "#090d14", // Clean solid background
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: outerPadding,
          borderRadius: shellRadius,
          overflow: "hidden",
          background: "#0f172a", // Slightly lighter inner background for depth
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid rgba(148,163,184,0.1)",
        }}
      >
        {imageData ? (
          // Use custom image if provided (clown.png)
          <img
            src={imageData}
            alt="App Icon"
            style={{
              width: maskable ? "80%" : "90%",
              height: "auto",
              objectFit: "contain",
              filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.4))",
            }}
          />
        ) : (
          // Fallback to minimal branding or SVG if needed
          <div style={{ color: "white", fontWeight: "bold", fontSize: size * 0.4 }}>O</div>
        )}
      </div>
    </div>
  );
}
