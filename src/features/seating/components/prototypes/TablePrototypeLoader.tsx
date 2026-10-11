"use client";

import dynamic from "next/dynamic";
const TablePrototype = dynamic(() => import("./TablePrototype"), { ssr: false });
export default function TablePrototypeLoader() { return <TablePrototype />; }
