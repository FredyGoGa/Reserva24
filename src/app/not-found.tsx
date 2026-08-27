import Link from "next/link"

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="mb-3 text-sm font-bold uppercase tracking-[0.24em] text-[#6f1d2a]">
        404
      </p>
      <h1 className="font-display text-4xl font-bold text-[#183c2c]">
        Página no encontrada
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-black/60">
        La ruta que intentas abrir no existe o ya no está disponible.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-[#183c2c] px-6 py-3 text-sm font-bold text-white"
      >
        Volver al inicio
      </Link>
    </main>
  )
}
