import crypto from "node:crypto"
import bcrypt from "bcryptjs"

export type AppRole = "USER" | "ADMIN"

export type SessionPayload = {
  sub: string
  email: string
  role: AppRole
}

const SESSION_SECRET = process.env.AUTH_SECRET ?? "dev-session-secret-change-me"

function encode(input: string) {
  return Buffer.from(input).toString("base64url")
}

function decode(input: string) {
  return Buffer.from(input, "base64url").toString("utf8")
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, comparedHash: string) {
  return bcrypt.compare(password, comparedHash)
}

export function createSessionToken(payload: SessionPayload) {
  const header = encode(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const body = encode(JSON.stringify(payload))
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url")

  return `${header}.${body}.${signature}`
}

export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || token.split(".").length !== 3) return null

  const [header, body, signature] = token.split(".")
  const expectedSignature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url")

  if (signature !== expectedSignature) return null

  try {
    const parsed = JSON.parse(decode(body)) as Partial<SessionPayload>
    if (!parsed.sub || !parsed.email || !parsed.role) return null
    if (parsed.role !== "USER" && parsed.role !== "ADMIN") return null
    return {
      sub: parsed.sub,
      email: parsed.email,
      role: parsed.role,
    }
  } catch {
    return null
  }
}

type RequestLike = {
  headers?: Headers | Record<string, string | string[] | undefined>
}

export function getSessionFromRequest(request: RequestLike): SessionPayload | null {
  const cookieHeader =
    request.headers instanceof Headers
      ? request.headers.get("cookie") ?? ""
      : typeof request.headers?.cookie === "string"
        ? request.headers.cookie
        : Array.isArray(request.headers?.cookie)
          ? request.headers.cookie[0] ?? ""
          : ""

  const sessionCookie = cookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith("reserva24_session="))

  if (!sessionCookie) return null

  const token = decodeURIComponent(sessionCookie.slice("reserva24_session=".length))
  return verifySessionToken(token)
}

export function getAdminSession(request: RequestLike): SessionPayload | null {
  const session = getSessionFromRequest(request)
  return session?.role === "ADMIN" ? session : null
}
