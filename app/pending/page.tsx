import Link from "next/link"

export default function PendingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6 py-16">
      <section className="w-full rounded-[2rem] border border-[#183c2c]/15 bg-white p-10 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6f1d2a]">Pago pendiente</p>
        <h1 className="mt-3 font-display text-3xl font-bold">Estamos esperando confirmación</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-black/60">
          Tu pedido quedó registrado. Te mostraremos el estado actualizado cuando Mercado Pago confirme el resultado.
        </p>
        <Link href="/" className="mt-7 inline-block rounded-full bg-[#183c2c] px-6 py-3 text-sm font-bold text-white">
          Volver al catálogo
        </Link>
      </section>
    </main>
  )
}
