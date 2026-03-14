import { ImageResponse } from "next/og";
import { AppIconArt } from "@/components/branding/AppIconArt";
import fs from "fs";
import path from "path";

export const dynamic = "force-static";

export async function GET() {
  const iconPath = path.join(process.cwd(), "public", "clown.png");
  const iconBuffer = fs.readFileSync(iconPath);
  const imageData = `data:image/png;base64,${iconBuffer.toString("base64")}`;

  return new ImageResponse(<AppIconArt size={192} imageData={imageData} />, {
    width: 192,
    height: 192,
  });
}
