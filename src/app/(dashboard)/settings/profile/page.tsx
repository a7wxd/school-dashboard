// src/app/(dashboard)/settings/profile/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ProfileSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { fullName: true, email: true, role: true, createdAt: true, lastLoginAt: true },
  });
  if (!user) redirect("/login");

  return (
    <div className="max-w-md space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-serif text-lg font-medium text-foreground">My profile</h2>
        <div className="mt-4 space-y-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Full name</p>
            <p className="text-foreground">{user.fullName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-foreground">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Role</p>
            <p className="capitalize text-foreground">{user.role.toLowerCase()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Last login</p>
            <p className="text-foreground">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("en-GB") : "This is your first login"}</p>
          </div>
        </div>
        <p className="mt-5 text-xs text-muted-foreground">
          Need your name, email, or password changed? Ask your administrator — account edits go through Settings → Users.
        </p>
      </div>
    </div>
  );
}
