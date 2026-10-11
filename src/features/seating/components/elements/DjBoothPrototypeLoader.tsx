"use client";

import dynamic from "next/dynamic";

const DjBoothPrototype = dynamic(() => import("./DjBoothPrototype"), { ssr: false });

export default function DjBoothPrototypeLoader() {
  return <DjBoothPrototype />;
}
