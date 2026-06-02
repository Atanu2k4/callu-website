import { NextResponse } from "next/server";
import crypto from "node:crypto";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import LoginOtp from "@/models/LoginOtp";
import { hashPassword } from "@/lib/password";
import { sendNotifyMail } from "@/lib/notifyMail";

const NAME_REGEX = /^[A-Za-z0-9 @_-]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const hashValue = (value: string) =>
  crypto.createHash("sha256").update(value).digest("hex");

const makeCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    const { name, username, email, password } = body || {};
    const rawName =
      typeof name === "string" ? name.trim() : typeof username === "string" ? username.trim() : "";
    const rawEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const rawPassword = typeof password === "string" ? password : "";

    if (!rawName || !rawEmail || !rawPassword) {
      return NextResponse.json({ message: "Name, email, and password are required" }, { status: 400 });
    }

    if (!NAME_REGEX.test(rawName)) {
      return NextResponse.json(
        { message: "Name can only include letters, numbers, spaces, @, _ and -" },
        { status: 400 }
      );
    }

    if (rawName.length < 2 || rawName.length > 40) {
      return NextResponse.json(
        { message: "Name must be between 2 and 40 characters" },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(rawEmail)) {
      return NextResponse.json(
        { message: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    if (rawPassword.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    await dbConnect();

    const existingUser = await User.findOne({ email: rawEmail });
    if (existingUser) {
      return NextResponse.json({ message: "Email already in use" }, { status: 409 });
    }

    // Hash the password now — we'll store it in the OTP record temporarily
    const passwordHash = await hashPassword(rawPassword);

    // Generate OTP
    const code = makeCode();
    const codeHash = hashValue(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store pending signup data in OTP record (no user created yet)
    await LoginOtp.findOneAndUpdate(
      { email: rawEmail },
      {
        codeHash,
        expiresAt,
        purpose: "signup",
        pendingUser: { name: rawName, passwordHash },
      },
      { upsert: true, returnDocument: "after" }
    );

    console.log(`[Signup] OTP generated for pending user: ${rawEmail}`);

    const subject = "Verify your CALLU account";
    const text = `Your CALLU verification code is ${code}. It expires in 10 minutes.`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background:#09090b; color:#ffffff; padding:32px;">
        <div style="max-width:520px;margin:0 auto;background:#18181b;border-radius:16px;padding:28px;border:1px solid #27272a;">
          <h1 style="margin:0 0 12px;font-size:22px;">Verify your email</h1>
          <p style="margin:0 0 18px;color:#a1a1aa;">Enter this code to complete your CALLU account setup. It expires in 10 minutes.</p>
          <div style="font-size:32px;font-weight:700;letter-spacing:8px;background:#0f172a;border:1px solid #1f2937;border-radius:12px;padding:16px;text-align:center;">
            ${code}
          </div>
          <p style="margin:16px 0 0;color:#71717a;font-size:12px;">If you didn't create a CALLU account, ignore this email.</p>
        </div>
      </div>
    `;

    try {
      await sendNotifyMail({ to: rawEmail, subject, text, html });
      console.log(`[Signup] ✅ Verification email sent to ${rawEmail}`);
    } catch (emailError: any) {
      console.error(`[Signup] ❌ Failed to send OTP to ${rawEmail}:`, emailError?.message);
      // Clean up the pending OTP since email failed
      await LoginOtp.deleteOne({ email: rawEmail });
      return NextResponse.json(
        { message: "Failed to send verification email. Please try again." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        requiresOtp: true,
        email: rawEmail,
        message: `A verification code has been sent to ${rawEmail}`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[Signup] Error:", error?.message || error);
    return NextResponse.json({ message: "Signup failed" }, { status: 500 });
  }
}
