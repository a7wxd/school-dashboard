// src/lib/navigation.ts
// Single source of truth for the sidebar's main sections. Every role sees the
// same entry points; pages gate their own content by permission internally
// (e.g. Settings shows a reduced subset to Teachers) rather than hiding whole
// sections, since Teachers still need e.g. their own profile within Settings.

import type { LucideIcon } from "lucide-react";
import { BarChart3, GraduationCap, BookOpen, FileText, Mail, Settings, LayoutDashboard } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Students", href: "/students", icon: GraduationCap },
  { label: "Subjects", href: "/subjects", icon: BookOpen },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Parents", href: "/parents", icon: Mail },
  { label: "Settings", href: "/settings", icon: Settings },
];
