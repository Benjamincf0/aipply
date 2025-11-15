"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Archive, BriefcaseBusiness, Home, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SideBar() {
  const path = usePathname();

  const routes = [
    { href: "/", icon: Home },
    { href: "/jobs", icon: Archive },
    { href: "/apply", icon: BriefcaseBusiness },
    { href: "/config", icon: Settings },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {routes.map((route) => (
                <SidebarMenuItem key={route.href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      path === route.href
                        ? "hover:bg-sidebar-primary hover:text-sidebar-primary-foreground bg-sidebar-primary text-sidebar-primary-foreground"
                        : "",
                    )}
                  >
                    <Link href={route.href} className="flex items-center gap-2">
                      <route.icon />
                      <span>
                        {route.href.slice(1) === ""
                          ? "Home"
                          : route.href.slice(1).slice(0, 1).toUpperCase() +
                            route.href.slice(1).slice(1)}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
