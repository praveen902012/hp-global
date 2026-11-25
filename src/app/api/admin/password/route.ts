import { NextResponse } from "next/server";
import {
  changeAdminPassword,
  getAdminSession,
  validateAdminCredentials,
} from "../../../../lib/server/auth";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { currentPassword, newPassword } = await request.json().catch(() => ({}));
  const current = String(currentPassword || "");
  const next = String(newPassword || "");

  if (!(await validateAdminCredentials(session.email, current))) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }

  if (next.length < 10) {
    return NextResponse.json(
      { error: "New password must be at least 10 characters." },
      { status: 400 },
    );
  }

  if (current === next) {
    return NextResponse.json(
      { error: "New password must be different from the current password." },
      { status: 400 },
    );
  }

  await changeAdminPassword(session.email, next);
  return NextResponse.json({ ok: true });
}
