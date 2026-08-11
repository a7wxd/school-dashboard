// src/components/students/profile/ParentContactsCard.tsx
import { Mail, Phone, Star } from "lucide-react";

export interface ParentContactRow {
  id: string;
  name: string;
  relationship: string;
  email: string;
  phone: string | null;
  isPrimaryContact: boolean;
}

export function ParentContactsCard({ contacts }: { contacts: ParentContactRow[] }) {
  if (contacts.length === 0) {
    return <p className="text-sm text-muted-foreground">No parent contacts on file.</p>;
  }

  return (
    <ul className="space-y-4">
      {contacts.map((contact) => (
        <li key={contact.id} className="rounded-lg border border-border p-4">
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground">{contact.name}</p>
            {contact.isPrimaryContact && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
                <Star size={11} fill="currentColor" /> Primary
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{contact.relationship}</p>
          <div className="mt-2 space-y-1 text-sm text-foreground">
            <p className="flex items-center gap-1.5">
              <Mail size={13} className="text-muted-foreground" /> {contact.email}
            </p>
            {contact.phone && (
              <p className="flex items-center gap-1.5">
                <Phone size={13} className="text-muted-foreground" /> {contact.phone}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
