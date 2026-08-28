import { NextResponse } from "next/server";
import { createAdminSession, validateAdminCredentials } from "../../../../lib/server/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}));

  if (!(await validateAdminCredentials(String(email || ""), String(password || "")))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await createAdminSession(String(email));
  return NextResponse.json({ user: { email } });
}
