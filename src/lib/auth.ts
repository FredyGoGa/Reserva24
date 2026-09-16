import crypto from "node:crypto"
import bcrypt from "bcryptjs"

export type AppRole = "USER" | "ADMIN"

export type SessionPayload = {
  sub: string
  email: string
  role: AppRole
  iat?: number
  exp?: number
}

const DEVELOPMENT_SESSION_SECRET = "dev-session-secret-change-me"
const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7

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

export function getSessionTtlSeconds() {
  const configuredTtl = Number(process.env.SESSION_TTL_SECONDS ?? DEFAULT_SESSION_TTL_SECONDS)
  if (!Number.isInteger(configuredTtl) || configuredTtl < 60 || configuredTtl > 60 * 60 * 24 * 30) {
    throw new Error("SESSION_TTL_SECONDS debe estar entre 60 segundos y 30 días")
  }
  return configuredTtl
}

function getSessionSecret() {
  const configuredSecret = process.env.AUTH_SECRET
  if (configuredSecret && configuredSecret.length >= 32) return configuredSecret

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET debe tener al menos 32 caracteres en producción")
  }

  return DEVELOPMENT_SESSION_SECRET
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSessionSecret()).update(value).digest()
}

export function createSessionToken(payload: SessionPayload) {
  const header = encode(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const now = Math.floor(Date.now() / 1000)
  const body = encode(JSON.stringify({ ...payload, iat: now, exp: now + getSessionTtlSeconds() }))
  const signature = sign(`${header}.${body}`).toString("base64url")

  return `${header}.${body}.${signature}`
}

export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || token.split(".").length !== 3) return null

  const [header, body, signature] = token.split(".")
  const receivedSignature = Buffer.from(signature, "base64url")
  const expectedSignature = sign(`${header}.${body}`)
  if (receivedSignature.length !== expectedSignature.length || !crypto.timingSafeEqual(receivedSignature, expectedSignature)) return null

  try {
    const parsedHeader = JSON.parse(decode(header)) as { alg?: string; typ?: string }
    const parsed = JSON.parse(decode(body)) as Partial<SessionPayload>
    const now = Math.floor(Date.now() / 1000)
    if (parsedHeader.alg !== "HS256" || parsedHeader.typ !== "JWT") return null
    if (!parsed.sub || !parsed.email || !parsed.role || !Number.isInteger(parsed.iat) || !Number.isInteger(parsed.exp)) return null
    const issuedAt = parsed.iat as number
    const expiresAt = parsed.exp as number
    if (expiresAt <= now || issuedAt > now + 60 || expiresAt <= issuedAt) return null
    if (parsed.role !== "USER" && parsed.role !== "ADMIN") return null
    return {
      sub: parsed.sub,
      email: parsed.email,
      role: parsed.role,
      iat: issuedAt,
      exp: expiresAt,
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
