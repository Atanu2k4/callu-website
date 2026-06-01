import nodemailer from "nodemailer";

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

// Create a reusable SMTP transporter
const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      "Email service not configured: Missing SMTP_HOST, SMTP_USER, or SMTP_PASS"
    );
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465, // true for port 465, false for 587
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    // Force IPv4 — Railway does not route IPv6 outbound SMTP
    family: 4,
    // Connection timeouts for cloud environments
    connectionTimeout: 10000, // 10s
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: false, // avoid TLS cert mismatches on Railway
    },
  });
};

export const sendNotifyMail = async ({
  to,
  bcc,
  subject,
  text,
  html,
}: NotifyMailParams) => {
  const { SMTP_USER, SMTP_FROM_NAME } = process.env;

  if (!isValidEmail(to)) {
    console.warn(`[Email] Invalid recipient email: ${to}`);
    throw new Error(`Invalid email address: ${to}`);
  }

  const fromName = SMTP_FROM_NAME || "CALLU";
  const fromAddress = SMTP_USER || "";
  const from = `${fromName} <${fromAddress}>`;

  const transporter = createTransporter();

  const mailOptions: nodemailer.SendMailOptions = {
    from,
    to,
    subject,
    text,
    html,
    ...(bcc && isValidEmail(bcc) ? { bcc } : {}),
  };

  console.log(`[Email] Sending email via SMTP to: ${to}, FROM: ${from}`);

  const info = await transporter.sendMail(mailOptions);

  console.log(`[Email] ✅ Email sent successfully. MessageId: ${info.messageId}`);
  return info;
};
