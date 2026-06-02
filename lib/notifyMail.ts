import Mailjet from "node-mailjet";

export type NotifyMailParams = {
  to: string;
  bcc?: string;
  subject: string;
  text: string;
  html: string;
};

// Validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const sendNotifyMail = async ({
  to,
  bcc,
  subject,
  text,
  html,
}: NotifyMailParams) => {
  const apiKey = process.env.MAILJET_API_KEY;
  const apiSecret = process.env.MAILJET_API_SECRET;
  const fromEmail = process.env.MAILJET_FROM_EMAIL;
  const fromName = process.env.MAILJET_FROM_NAME || "CALLU";

  if (!apiKey || !apiSecret) {
    throw new Error(
      "Email service not configured: Missing MAILJET_API_KEY or MAILJET_API_SECRET"
    );
  }

  if (!fromEmail) {
    throw new Error(
      "Email service not configured: Missing MAILJET_FROM_EMAIL"
    );
  }

  if (!isValidEmail(to)) {
    console.warn(`[Email] Invalid recipient email: ${to}`);
    throw new Error(`Invalid email address: ${to}`);
  }

  const mailjet = new Mailjet({ apiKey, apiSecret });

  const recipients: { Email: string }[] = [{ Email: to }];

  const body: Record<string, unknown> = {
    Messages: [
      {
        From: { Email: fromEmail, Name: fromName },
        To: recipients,
        Subject: subject,
        TextPart: text,
        HTMLPart: html,
        ...(bcc && isValidEmail(bcc)
          ? { Bcc: [{ Email: bcc }] }
          : {}),
      },
    ],
  };

  console.log(`[Email] Sending email via Mailjet to: ${to}, FROM: ${fromName} <${fromEmail}>`);

  const result = await mailjet
    .post("send", { version: "v3.1" })
    .request(body);

  const messageId =
    (result.body as any)?.Messages?.[0]?.To?.[0]?.MessageID ?? "unknown";

  console.log(`[Email] ✅ Email sent successfully. MessageId: ${messageId}`);
  return result;
};
