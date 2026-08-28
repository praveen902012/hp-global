import crypto from "node:crypto";
import { cookies } from "next/headers";
import { query } from "./db";

const sessionCookieName = "hpg_admin_session";
const sessionDuration = 24 * 60 * 60 * 1000;

interface SessionPayload {
  email: string;
  expiresAt: number;
}

function sameSecret(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET or ADMIN_PASSWORD is required.");
  return secret;
}

function signSession(payload: SessionPayload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", getSessionSecret()).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

function readSession(token: string): SessionPayload | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = crypto.createHmac("sha256", getSessionSecret()).update(encoded).digest("base64url");
  if (!sameSecret(signature, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.email || !payload.expiresAt || payload.expiresAt < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, expectedHash] = storedHash.split(":");
  if (algorithm !== "scrypt" || !salt || !expectedHash) return false;

  const actualHash = crypto.scryptSync(password, salt, 64).toString("hex");
  return sameSecret(actualHash, expectedHash);
}

export async function validateAdminCredentials(email: string, password: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
  }

  if (email !== adminEmail) return false;

  const result = await query<{ password_hash: string }>(
    "SELECT password_hash FROM admin_credentials WHERE email = $1",
    [email],
  );

  if (result.rowCount) {
    return verifyPassword(password, result.rows[0].password_hash);
  }

  return sameSecret(password, adminPassword);
}

export async function changeAdminPassword(email: string, password: string) {
  const passwordHash = hashPassword(password);
  await query(
    `INSERT INTO admin_credentials (email, password_hash, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (email) DO UPDATE
     SET password_hash = EXCLUDED.password_hash, updated_at = NOW()`,
    [email, passwordHash],
  );
}

export async function createAdminSession(email: string) {
  const token = signSession({
    email,
    expiresAt: Date.now() + sessionDuration,
  });

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionDuration / 1000,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  const session = token ? readSession(token) : null;
  if (!session) return null;

  return { email: session.email };
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    return null;
  }

  return session;
}
