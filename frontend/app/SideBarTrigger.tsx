"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export default function SideBarTrigger() {
  const path = usePathname();

  return (
    <div className="flex shrink-0 items-center gap-2">
      <SidebarTrigger />
      <span className="text-primary/80">|</span>
      <span className="ml-1.5">
        {path.slice(1) === ""
          ? "Home"
          : path.slice(1).slice(0, 1).toUpperCase() + path.slice(1).slice(1)}
      </span>
    </div>
  );
}
