import { z } from "zod";
export { brand } from "./brand.ts";

const text = (max: number) => z.string().trim().max(max);
const date = z.union([z.literal(""), z.iso.date()]);
export const draftSchema = z
  .object({
    title: text(160).min(1, "Give your request a title."),
    entityId: text(100).nullable().default(null),
    recipientName: text(200).min(1, "Choose or enter a recipient."),
    recipientEmail: z.union([z.literal(""), z.email()]).default(""),
    jurisdictionId: text(10).min(1),
    description: text(12000).default(""),
    dateFrom: date.default(""),
    dateTo: date.default(""),
    requesterName: text(200).default(""),
    requesterEmail: z.union([z.literal(""), z.email()]).default(""),
    feeLimit: z.number().min(0).max(10000).nullable().default(null),
  })
  .refine((d) => !d.dateFrom || !d.dateTo || d.dateFrom <= d.dateTo, {
    message: "The end date must be on or after the start date.",
    path: ["dateTo"],
  });
export type Draft = z.infer<typeof draftSchema>;
export type RequestStatus =
  | "draft"
  | "filed"
  | "acknowledged"
  | "completed"
  | "closed";
export interface RecordsRequest extends Draft {
  id: string;
  status: RequestStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  filedAt: string | null;
  referenceNumber: string;
  guidanceVersion: string | null;
}
export const updateSchema = z.object({
  draft: draftSchema,
  version: z.number().int().positive(),
});
export const eventSchema = z.object({
  status: z.enum(["filed", "acknowledged", "completed", "closed"]),
  occurredAt: z.iso.date(),
  referenceNumber: text(200).default(""),
  note: text(3000).default(""),
  version: z.number().int().positive(),
});
export interface TimelineEvent {
  id: string;
  kind: string;
  note: string;
  occurredAt: string;
  createdAt: string;
}
export interface Source {
  title: string;
  url: string;
  checkedAt: string;
}
export interface Jurisdiction {
  id: string;
  name: string;
  guidanceVersion: string | null;
  summary: string;
  notes: string[];
  sources: Source[];
}
export interface Entity {
  id: string;
  name: string;
  description: string;
  jurisdictionId: string;
  kind: string;
  website: string;
  custodian: string | null;
  channel: "email" | "portal" | "unverified";
  filingUrl: string | null;
  filingEmail: string | null;
  instructions: string;
  verification: "source_checked" | "imported";
  checkedAt: string | null;
  sourceUrl: string;
  logoPath: string | null;
}
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
}
export interface PublicConfig {
  authAvailable: boolean;
  sessionAvailable: boolean;
  authProviders: { email: boolean; google: boolean };
  developmentMailbox: boolean;
  stage: string;
}

// Historical imports contain Windows paths. Only expose a same-origin asset URL.
export function logoPathFor(value: string | null | undefined): string | null {
  if (!value) return null;
  const filename = value.replace(/\\/g, "/").split("/").pop();
  if (
    !filename ||
    !/\.(?:svg|png|jpg|jpeg|webp|gif|svg_full|png_w_3840_q_75)$/i.test(filename)
  )
    return null;
  return "/logos/" + encodeURIComponent(filename);
}
export interface RequestDetail {
  request: RecordsRequest;
  events: TimelineEvent[];
  entity: Entity | null;
  jurisdiction: Jurisdiction;
}

// Template-only drafting. Legal assertions and statutory deadlines are not generated.
export function renderLetter(draft: Draft): string {
  const period =
    draft.dateFrom || draft.dateTo
      ? `\nRecords period: ${draft.dateFrom || "earliest available"} through ${draft.dateTo || "the date of this request"}.\n`
      : "";
  const fee =
    draft.feeLimit === null
      ? "Please provide a cost estimate before incurring any charge."
      : `Please contact me before incurring fees exceeding $${draft.feeLimit.toFixed(2)}.`;
  return `To: ${draft.recipientName}\n${draft.recipientEmail ? draft.recipientEmail + "\n" : ""}\nSubject: Public records request — ${draft.title}\n\nI request access to copies of the following existing records:\n\n${draft.description || "[Describe the records you are seeking]"}\n${period}\nI prefer electronic copies in a format you maintain, where available.\n\n${fee}\n\nIf clarification would help identify responsive records, please contact me. If records are withheld, please identify the applicable basis and provide any reasonably separable portions that may be released.\n\nThank you,\n${draft.requesterName || "[Your name]"}\n${draft.requesterEmail || "[Your email]"}\n`;
}
