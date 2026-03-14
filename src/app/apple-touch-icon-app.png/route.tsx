import { ImageResponse } from "next/og";
import { AppIconArt } from "@/components/branding/AppIconArt";
export const dynamic = "force-static";

export async function GET() {
  return new ImageResponse(<AppIconArt size={180} />, {
    width: 180,
    height: 180,
  });
}
