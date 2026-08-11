// src/lib/validation/settings.ts
import { z } from "zod";

const hexColour = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Enter a valid hex colour, e.g. #1E3A8A");

export const schoolSettingsSchema = z.object({
  schoolName: z.string().min(1, "Enter a school name"),
  logoUrl: z.string().url("Enter a valid URL").or(z.literal("")).optional(),
  primaryColour: hexColour,
  secondaryColour: hexColour,
});

export type SchoolSettingsInput = z.infer<typeof schoolSettingsSchema>;

export const reportTemplateSchema = z.object({
  footerNote: z.string().max(500).optional(),
});

export type ReportTemplateInput = z.infer<typeof reportTemplateSchema>;
