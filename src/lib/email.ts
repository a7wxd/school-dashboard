// src/lib/email.ts
// Real email delivery via Resend. If RESEND_API_KEY isn't configured, sends
// fail honestly (deliveryStatus "FAILED" with a clear reason) rather than
// pretending to succeed — see how the send route uses this.

import { Resend } from "resend";

export interface SendReportEmailParams {
  to: string;
  parentName: string;
  studentName: string;
  termLabel: string;
  schoolName: string;
  pdfBuffer: Buffer;
  pdfFilename: string;
}

export interface SendEmailResult {
  success: boolean;
  providerMessageId?: string;
  error?: string;
}

export async function sendReportEmail(params: SendReportEmailParams): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: "Email isn't configured yet — set RESEND_API_KEY (and EMAIL_FROM_DOMAIN) in .env.",
    };
  }

  const fromDomain = process.env.EMAIL_FROM_DOMAIN ?? "example.com";
  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: `${params.schoolName} <reports@${fromDomain}>`,
      to: params.to,
      subject: `${params.studentName}'s ${params.termLabel} report — ${params.schoolName}`,
      html: `
        <p>Dear ${params.parentName},</p>
        <p>Please find attached ${params.studentName}'s ${params.termLabel} report.</p>
        <p>If you have any questions, please get in touch with the school office.</p>
        <p>Kind regards,<br/>${params.schoolName}</p>
      `,
      attachments: [{ filename: params.pdfFilename, content: params.pdfBuffer }],
    });

    if (error) return { success: false, error: error.message };
    return { success: true, providerMessageId: data?.id };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Unknown email error" };
  }
}
