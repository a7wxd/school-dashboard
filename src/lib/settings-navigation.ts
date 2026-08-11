// src/lib/settings-navigation.ts
// Settings shows a different sub-nav per role: admins get the full set,
// teachers just get their own profile — matching "Settings only fully
// visible to Admin; Teachers see a reduced subset" from the spec.

export interface SettingsNavItem {
  label: string;
  href: string;
}

export const ADMIN_SETTINGS_NAV: SettingsNavItem[] = [
  { label: "School", href: "/settings/school" },
  { label: "Academic Year", href: "/settings/academic-year" },
  { label: "Users", href: "/settings/users" },
  { label: "Subjects", href: "/settings/subjects" },
  { label: "Report Templates", href: "/settings/report-templates" },
  { label: "Backups", href: "/settings/backups" },
  { label: "My Profile", href: "/settings/profile" },
];

export const TEACHER_SETTINGS_NAV: SettingsNavItem[] = [{ label: "My Profile", href: "/settings/profile" }];
