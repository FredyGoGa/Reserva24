import { NextResponse } from "next/server"

/**
 * Next.js no sirve la API de negocio. La única API soportada es el backend
 * Express; este cierre evita que las rutas legacy de app/api queden públicas.
 */
export function proxy() {
  return new NextResponse(null, { status: 404 })
}

export const config = {
  matcher: "/api/:path*",
}
