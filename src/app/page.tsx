"use client";

import { useConfig } from "@/context/ConfigContext";
import { ConfigLoader } from "@/components/editor/ConfigLoader";
import { MainEditor } from "@/components/editor/MainEditor";

export default function Home() {
  const { isLoaded } = useConfig();

  if (!isLoaded) {
    return <ConfigLoader />;
  }

  return <MainEditor />;
}
