import { NextResponse } from "next/server";
import { clearLoginFailures, createAdminSession, isLoginRateLimited, loginRateLimitKey, recordLoginFailure, validateAdminCredentials } from "../../../../lib/server/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}));
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const key = loginRateLimitKey(address, String(email || ""));

  if (isLoginRateLimited(key)) {
    return NextResponse.json({ error: "Too many sign-in attempts. Please try again in 15 minutes." }, { status: 429 });
  }

  if (!(await validateAdminCredentials(String(email || ""), String(password || "")))) {
    recordLoginFailure(key);
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  clearLoginFailures(key);
  await createAdminSession(String(email));
  return NextResponse.json({ user: { email } });
}
