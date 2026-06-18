import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = "Steward <noreply@steward.app>";

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  if (resend) {
    await resend.emails.send({ from: FROM, ...payload });
  } else if (process.env.NODE_ENV === "development") {
    console.log(`[Email] To: ${payload.to} | Subject: ${payload.subject}`);
  }
}

// ─── Templates ───────────────────────────────────────────────────────────────

export async function sendBudgetSubmittedEmail(opts: {
  to: string;
  reviewerName: string;
  submitterName: string;
  budgetTitle: string;
  amount: number;
  reviewUrl: string;
}) {
  await sendEmail({
    to: opts.to,
    subject: `Budget submitted for review: ${opts.budgetTitle}`,
    html: `
      <p>Hi ${opts.reviewerName},</p>
      <p><strong>${opts.submitterName}</strong> has submitted a budget for your review:</p>
      <p><strong>${opts.budgetTitle}</strong> — KES ${opts.amount.toLocaleString()}</p>
      <p><a href="${opts.reviewUrl}">Review Budget →</a></p>
      <p>— Steward</p>
    `,
  });
}

export async function sendApprovalDecisionEmail(opts: {
  to: string;
  submitterName: string;
  budgetTitle: string;
  decision: "approved" | "rejected" | "needs_changes";
  comment?: string;
  budgetUrl: string;
}) {
  const decisionText = {
    approved: "✅ Approved",
    rejected: "❌ Rejected",
    needs_changes: "⚠️ Needs Changes",
  }[opts.decision];

  await sendEmail({
    to: opts.to,
    subject: `Budget ${opts.decision.replace("_", " ")}: ${opts.budgetTitle}`,
    html: `
      <p>Hi ${opts.submitterName},</p>
      <p>Your budget <strong>${opts.budgetTitle}</strong> has been reviewed:</p>
      <p><strong>${decisionText}</strong></p>
      ${opts.comment ? `<p>Comment: ${opts.comment}</p>` : ""}
      <p><a href="${opts.budgetUrl}">View Budget →</a></p>
      <p>— Steward</p>
    `,
  });
}

export async function sendInviteEmail(opts: {
  to: string;
  inviterName: string;
  orgName: string;
  role: string;
  inviteUrl: string;
}) {
  await sendEmail({
    to: opts.to,
    subject: `You've been invited to ${opts.orgName} on Steward`,
    html: `
      <p>Hi,</p>
      <p><strong>${opts.inviterName}</strong> has invited you to join <strong>${opts.orgName}</strong> on Steward as a <strong>${opts.role}</strong>.</p>
      <p><a href="${opts.inviteUrl}">Accept Invitation →</a></p>
      <p>This invitation expires in 7 days.</p>
      <p>— Steward</p>
    `,
  });
}
