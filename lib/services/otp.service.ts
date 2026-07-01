// lib/services/otp.service.ts

import resend from "@/lib/mail/resend";
import { otpTemplate } from "@/lib/mail/templates";

const FROM = "Titan Bank <notifications@titanbank.com>";
const OTP_TTL_MS = 5 * 60 * 1000;

type OtpRecord = {
  code: string;
  userId: string;
  email: string;
  expiresAt: number;
};

const otpStore = new Map<string, OtpRecord>();

export function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function sendTransferPinOtp(userId: string, email: string) {
  const code = generateOtpCode();
  const expiresAt = Date.now() + OTP_TTL_MS;

  otpStore.set(userId, { code, userId, email, expiresAt });

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Your Titan Bank Transfer PIN Verification Code",
      html: otpTemplate({ fullName: "", code }),
    });
  } catch (err) {
    console.error("[otp] Failed to send OTP email:", err);
    throw new Error("Failed to send verification email.");
  }

  return { success: true };
}

export function verifyTransferPinOtp(userId: string, code: string): boolean {
  const record = otpStore.get(userId);

  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    otpStore.delete(userId);
    return false;
  }
  if (record.code !== code) return false;

  otpStore.delete(userId);
  return true;
}
