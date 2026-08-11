// src/lib/academic-year.ts
import { prisma } from "./prisma";

const TERM_LABELS: Record<string, string> = {
  TERM_1: "Term 1",
  TERM_2: "Term 2",
  TERM_3: "Term 3",
};

/** Returns something like "Term 2 · 2026/2027", or the year label if between terms, or null if none configured. */
export async function getCurrentTermLabel(): Promise<string | null> {
  const year = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
  if (!year) return null;

  const now = new Date();
  if (now >= year.term1Start && now <= year.term1End) return `${TERM_LABELS.TERM_1} · ${year.label}`;
  if (now >= year.term2Start && now <= year.term2End) return `${TERM_LABELS.TERM_2} · ${year.label}`;
  if (now >= year.term3Start && now <= year.term3End) return `${TERM_LABELS.TERM_3} · ${year.label}`;
  return year.label;
}

export async function getCurrentAcademicYear() {
  return prisma.academicYear.findFirst({ where: { isCurrent: true } });
}
