import { NextResponse } from "next/server";
import crypto from "node:crypto";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import LoginOtp from "@/models/LoginOtp";
import { sendNotifyMail } from "@/lib/notifyMail";


const hashValue = (value: string) =>
  crypto.createHash("sha256").update(value).digest("hex");

const makeCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      console.error("[OTP] JSON parse error - empty or invalid body");
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    const { email } = body;
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
    }



    await dbConnect();
    const user = await User.findOne({ email });

    if (!user) {
      console.warn(`[OTP] User not found for email: ${email}`);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.status !== "approved") {
      console.warn(`[OTP] User not approved: ${email}, status: ${user.status}`);
      return NextResponse.json(
        { message: "Your application is still pending review." },
        { status: 403 }
      );
    }

    const code = makeCode();
    const codeHash = hashValue(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log(`[OTP] Generated OTP for ${email}, expires at ${expiresAt.toISOString()}`);

    await LoginOtp.findOneAndUpdate(
      { email },
      { codeHash, expiresAt },
      { upsert: true, returnDocument: "after" }
    );

    const subject = "Your CALLU verification code";
    const text = `Your CALLU verification code is ${code}. It expires in 10 minutes.`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background:#09090b; color:#ffffff; padding:32px;">
        <div style="max-width:520px;margin:0 auto;background:#18181b;border-radius:16px;padding:28px;border:1px solid #27272a;">
          <h1 style="margin:0 0 12px;font-size:22px;">CALLU verification</h1>
          <p style="margin:0 0 18px;color:#a1a1aa;">Use this code to sign in. It expires in 10 minutes.</p>
          <div style="font-size:32px;font-weight:700;letter-spacing:8px;background:#0f172a;border:1px solid #1f2937;border-radius:12px;padding:16px;text-align:center;">
            ${code}
          </div>
          <p style="margin:16px 0 0;color:#71717a;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      </div>
    `;

    try {
      console.log(`[OTP] Sending OTP email to ${email}...`);
      await sendNotifyMail({ to: email, subject, text, html });
      console.log(`[OTP] ✅ OTP email sent successfully to ${email}`);
      return NextResponse.json({ message: "Verification code sent" }, { status: 200 });
    } catch (emailError: any) {
      const errorMsg = emailError?.message || emailError?.toString() || "Unknown email error";
      console.error(`[OTP] ❌ Email send FAILED for ${email}:`, errorMsg);
      return NextResponse.json(
        { message: "Failed to send verification code. Please try again." },
        { status: 503 }
      );
    }
  } catch (error: any) {
    const errorMsg = error?.message || error?.toString() || "Failed to send code";
    console.error("[OTP] Fatal error:", errorMsg, error);
    return NextResponse.json(
      {
        message: errorMsg,
        debug: process.env.NODE_ENV === "development" ? error?.stack : undefined,
      },
      { status: 500 }
    );
  }
}
