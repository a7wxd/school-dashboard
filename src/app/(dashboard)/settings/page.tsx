// src/app/(dashboard)/settings/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SettingsIndexPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  redirect(session.user.role === "ADMIN" ? "/settings/school" : "/settings/profile");
}
