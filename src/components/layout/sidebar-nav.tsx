"use client";

import { usePathname } from "next/navigation";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LayoutDashboard, Timer, ClipboardList, Bell, CalendarDays, Folder, FileText, LogIn } from "lucide-react";
import Link from "next/link";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/focus", label: "Focus Session", icon: Timer },
  { href: "/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/notices", label: "Notice Board", icon: Bell },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/resources", label: "Resources", icon: Folder },
  { href: "/resume-builder", label: "AI Resume Builder", icon: FileText },
  { href: "/login", label: "Login", icon: LogIn },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              isActive={pathname === item.href}
              tooltip={{ children: item.label, side: "right", align: "center" }}
            >
              <item.icon />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
