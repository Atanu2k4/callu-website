/**
 * Validate critical environment configuration at startup
 */
export function validateEmailConfig(): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost) {
    issues.push("❌ SMTP_HOST is not configured");
  }

  if (!smtpUser) {
    issues.push("❌ SMTP_USER is not configured");
  }

  if (!smtpPass) {
    issues.push("❌ SMTP_PASS is not configured");
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

export function logConfigStatus(): void {
  const { valid, issues } = validateEmailConfig();

  if (valid) {
    console.log("✅ Email configuration is valid");
  } else {
    console.warn("\n📧 EMAIL CONFIGURATION ISSUES:\n");
    issues.forEach((issue) => console.warn(`  ${issue}`));
    console.warn("\n");
  }
}
