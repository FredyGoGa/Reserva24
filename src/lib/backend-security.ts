import type { NextFunction, Request, Response } from "express"

const production = process.env.NODE_ENV === "production"

export function assertBackendConfiguration() {
  const required = ["DATABASE_URL", "AUTH_SECRET", "FRONTEND_ORIGIN", "MERCADO_PAGO_ACCESS_TOKEN", "MERCADO_PAGO_WEBHOOK_SECRET", "BACKEND_PUBLIC_URL"]
  const missing = required.filter((name) => !process.env[name])
  if (production && missing.length > 0) {
    throw new Error(`Faltan variables de entorno requeridas en producción: ${missing.join(", ")}`)
  }

  const secret = process.env.AUTH_SECRET
  if (production && (!secret || secret.length < 32)) {
    throw new Error("AUTH_SECRET debe tener al menos 32 caracteres en producción")
  }

  const origin = process.env.FRONTEND_ORIGIN
  if (production && (!origin || origin.includes("*") || !origin.startsWith("https://"))) {
    throw new Error("FRONTEND_ORIGIN debe ser un origen HTTPS específico en producción")
  }

  const backendPublicUrl = process.env.BACKEND_PUBLIC_URL
  if (production && (!backendPublicUrl || !backendPublicUrl.startsWith("https://"))) {
    throw new Error("BACKEND_PUBLIC_URL debe ser una URL HTTPS pública en producción")
  }
}

export function securityHeaders(request: Request, response: Response, next: NextFunction) {
  response.setHeader("X-Content-Type-Options", "nosniff")
  response.setHeader("X-Frame-Options", "DENY")
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin")
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  response.setHeader("Cache-Control", "no-store")
  if (production && request.secure) {
    response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
  }
  next()
}

type RateLimitOptions = {
  windowMs: number
  max: number
  key?: (request: Request) => string
}

export function rateLimit({ windowMs, max, key = (request) => request.ip ?? "unknown" }: RateLimitOptions) {
  const attempts = new Map<string, { count: number; resetAt: number }>()

  return (request: Request, response: Response, next: NextFunction) => {
    const now = Date.now()
    const identifier = key(request)
    const current = attempts.get(identifier)
    const entry = !current || current.resetAt <= now ? { count: 0, resetAt: now + windowMs } : current
    entry.count += 1
    attempts.set(identifier, entry)

    if (entry.count > max) {
      response.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000))
      response.status(429).json({ success: false, error: "Demasiadas solicitudes. Inténtalo más tarde." })
      return
    }

    if (attempts.size > 10_000) {
      for (const [storedKey, stored] of attempts) {
        if (stored.resetAt <= now) attempts.delete(storedKey)
      }
    }
    next()
  }
}

export function requireFrontendOrigin(frontendOrigin: string) {
  return (request: Request, response: Response, next: NextFunction) => {
    const origin = request.get("origin")
    if (origin && origin !== frontendOrigin) {
      response.status(403).json({ success: false, error: "Origen no permitido" })
      return
    }
    next()
  }
}
