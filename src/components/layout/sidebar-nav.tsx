"use client";

import { usePathname } from "next/navigation";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LayoutDashboard, Timer, ClipboardList, Bell, CalendarDays, Folder, FileText, LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, requiresAuth: true },
  { href: "/focus", label: "Focus Session", icon: Timer, requiresAuth: true },
  { href: "/assignments", label: "Assignments", icon: ClipboardList, requiresAuth: true },
  { href: "/notices", label: "Notice Board", icon: Bell, requiresAuth: true },
  { href: "/events", label: "Events", icon: CalendarDays, requiresAuth: true },
  { href: "/resources", label: "Resources", icon: Folder, requiresAuth: true },
  { href: "/resume-builder", label: "AI Resume Builder", icon: FileText, requiresAuth: true },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user, logOut } = useAuth();

  const displayedNavItems = navItems.filter(item => !item.requiresAuth || (item.requiresAuth && user));

  return (
    <SidebarMenu>
      {displayedNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href}>
            <SidebarMenuButton
              as="a"
              isActive={pathname === item.href}
              tooltip={{ children: item.label, side: "right", align: "center" }}
            >
              <item.icon />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
      <SidebarMenuItem>
        {user ? (
          <SidebarMenuButton
            onClick={() => logOut()}
            tooltip={{ children: "Logout", side: "right", align: "center" }}
          >
            <LogOut />
            <span>Logout</span>
          </SidebarMenuButton>
        ) : (
          <Link href="/login">
            <SidebarMenuButton
              as="a"
              isActive={pathname === "/login"}
              tooltip={{ children: "Login", side: "right", align: "center" }}
            >
              <LogIn />
              <span>Login</span>
            </SidebarMenuButton>
          </Link>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
