
"use client";

import { usePathname } from "next/navigation";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LayoutDashboard, Timer, ClipboardList, Bell, CalendarDays, Folder, FileText, LogIn, LogOut, Shield } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

const allNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, roles: ['student', 'teacher', 'admin'] },
  { href: "/admin", label: "Admin Panel", icon: Shield, roles: ['admin'] },
  { href: "/focus", label: "Focus Session", icon: Timer, roles: ['student'] },
  { href: "/assignments", label: "Assignments", icon: ClipboardList, roles: ['student', 'teacher'] },
  { href: "/notices", label: "Notice Board", icon: Bell, roles: ['student', 'teacher', 'admin'] },
  { href: "/events", label: "Events", icon: CalendarDays, roles: ['student', 'teacher', 'admin'] },
  { href: "/resources", label: "Resources", icon: Folder, roles: ['student', 'teacher', 'admin'] },
  { href: "/resume-builder", label: "AI Resume Builder", icon: FileText, roles: ['student'] },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user, role, logOut } = useAuth();

  const navItems = allNavItems.filter(item => user && item.roles.includes(role || 'student'));

  return (
    <SidebarMenu>
      {user ? (
        <>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
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
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => logOut()}
              tooltip={{ children: "Logout", side: "right", align: "center" }}
            >
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </>
      ) : (
        <SidebarMenuItem>
          <Link href="/login" passHref>
            <SidebarMenuButton
              as="a"
              isActive={pathname === "/login"}
              tooltip={{ children: "Login", side: "right", align: "center" }}
            >
              <LogIn />
              <span>Login</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  );
}
