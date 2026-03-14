import { ImageResponse } from "next/og";
import { AppIconArt } from "@/components/branding/AppIconArt";
export const dynamic = "force-static";

export async function GET() {
  return new ImageResponse(<AppIconArt size={192} maskable />, {
    width: 192,
    height: 192,
  });
}
