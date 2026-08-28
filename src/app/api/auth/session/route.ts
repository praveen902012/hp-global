import { NextResponse } from "next/server";
import { getAdminSession } from "../../../../lib/server/auth";

export async function GET() {
  const user = await getAdminSession();
  return NextResponse.json({ user });
}
