import Link from "next/link"

export default function FailurePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6 py-16">
      <section className="w-full rounded-[2rem] border border-[#6f1d2a]/20 bg-white p-10 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6f1d2a]">Pago no completado</p>
        <h1 className="mt-3 font-display text-3xl font-bold">No pudimos confirmar el pago</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-black/60">
          Tu orden no se confirma hasta recibir una notificación válida de Mercado Pago. Puedes volver al catálogo e intentarlo de nuevo.
        </p>
        <Link href="/" className="mt-7 inline-block rounded-full bg-[#183c2c] px-6 py-3 text-sm font-bold text-white">
          Volver al catálogo
        </Link>
      </section>
    </main>
  )
}
