// src/app/(dashboard)/parents/page.tsx
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { Star } from "lucide-react";

export default async function ParentsPage({ searchParams }: { searchParams: { q?: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const q = searchParams.q?.trim();

  const contacts = await prisma.parentContact.findMany({
    where: {
      student: { deletedAt: null },
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { student: { select: { id: true, firstName: true, lastName: true, yearGroup: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader title="Parents" description="Contacts, linked students and communication history." />

      <form className="mb-6 max-w-sm">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by name or email…"
          className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
        />
      </form>

      {contacts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">No parent contacts found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Linked student</th>
                <th className="px-5 py-3 font-medium">Relationship</th>
                <th className="px-5 py-3 font-medium">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {contacts.map((contact) => (
                <tr key={contact.id} className="transition-default hover:bg-muted/40">
                  <td className="px-5 py-3.5">
                    <Link href={`/parents/${contact.id}`} className="flex items-center gap-1.5 font-medium text-foreground hover:text-brand">
                      {contact.name}
                      {contact.isPrimaryContact && <Star size={12} className="text-accent" fill="currentColor" />}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    <Link href={`/students/${contact.student.id}`} className="hover:text-brand">
                      {contact.student.firstName} {contact.student.lastName}
                    </Link>{" "}
                    <span className="text-xs">({contact.student.yearGroup.replace("Y", "Year ")})</span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{contact.relationship}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{contact.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
