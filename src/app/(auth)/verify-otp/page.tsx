import { cookies } from "next/headers";
import { VerifyOtpForm } from "@/features/auth/components/verify-otp-form";
import { readOtpEmailCookie, OTP_EMAIL_COOKIE } from "@/features/auth/actions/otp";

export default async function VerifyOtpPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string | string[] }>;
}) {
  const cookieStore = await cookies();
  const otpEmail = readOtpEmailCookie(cookieStore.get(OTP_EMAIL_COOKIE)?.value);
  const params = await searchParams;
  const type = Array.isArray(params.type) ? params.type[0] : params.type;

  return <VerifyOtpForm initialEmail={otpEmail?.email ?? ""} devOtp={otpEmail?.devOtp} otpType={type as "login" | undefined} />;
}
