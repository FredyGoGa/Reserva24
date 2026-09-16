import { NextResponse } from "next/server"

/**
 * Next.js no sirve la API de negocio. La única API soportada es Express.
 * Este cierre evita que una ruta API accidental vuelva a exponerse desde Next.
 */
export function proxy() {
  return new NextResponse(null, { status: 404 })
}

export const config = {
  matcher: "/api/:path*",
}
