import { ImageResponse } from "next/og";

export const alt = "Bahrain Athletics Association";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 72, background: "#0b0b0d", color: "white", position: "relative" }}>
        <div style={{ position: "absolute", right: -200, bottom: -200, width: 800, height: 800, borderRadius: 9999, border: "2px solid rgba(255,255,255,0.08)", display: "flex" }} />
        <div style={{ position: "absolute", right: -120, bottom: -120, width: 640, height: 640, borderRadius: 9999, border: "2px solid rgba(255,255,255,0.08)", display: "flex" }} />
        <div style={{ fontSize: 22, letterSpacing: 6, textTransform: "uppercase", color: "rgba(255,255,255,0.6)", display: "flex" }}>Bahrain Athletics Association</div>
        <div style={{ fontSize: 110, fontWeight: 800, lineHeight: 0.9, marginTop: 24, display: "flex", flexDirection: "column" }}>
          <span>EVERY STRIDE</span>
          <span style={{ display: "flex" }}><span style={{ color: "#ce1126" }}>FOR</span>&nbsp;BAHRAIN.</span>
        </div>
        <div style={{ width: 160, height: 6, background: "#ce1126", marginTop: 40, display: "flex" }} />
      </div>
    ),
    size,
  );
}
