"use client";

import { useConfig } from "@/context/ConfigContext";
import { ConfigLoader } from "@/components/editor/ConfigLoader";
import { MainEditor } from "@/components/editor/MainEditor";
import { IosInstallHint } from "@/components/ios-install-hint";

export default function Home() {
  const { isLoaded } = useConfig();

  return (
    <>
      {isLoaded ? <MainEditor /> : <ConfigLoader />}
      <IosInstallHint avoidBottomDock={isLoaded} />
    </>
  );
}
