import Link from "next/link"
import Catalog from "@/components/Catalog"
import Footer from "@/components/Footer"
import NavBar from "@/components/NavBar"

const benefits = [
  {
    number: "01",
    title: "Elige tus favoritos",
    text: "Explora una selección de licores, vinos y cervezas para cada ocasión.",
  },
  {
    number: "02",
    title: "Compra con tranquilidad",
    text: "Revisa tu pedido y completa tus datos de entrega de forma segura.",
  },
  {
    number: "03",
    title: "Recibe en tu puerta",
    text: "Preparamos tu compra y te la llevamos en Facatativá.",
  },
]

export default function Home() {
  return (
    <>
      <NavBar />
      <main>
        <section className="grain relative overflow-hidden bg-[#183c2c] text-white">
          <div className="absolute -right-32 -top-32 size-96 rounded-full border border-white/10" />
          <div className="absolute -bottom-52 right-24 size-[34rem] rounded-full border border-[#d7a63e]/20" />
          <div className="relative mx-auto grid min-h-[660px] max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
            <div>
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-[#f1c35d]">
                Licorería local · Facatativá
              </p>
              <h1 className="max-w-3xl font-display text-5xl font-bold leading-[0.98] sm:text-6xl lg:text-8xl">
                Brindemos por los buenos momentos.
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/65 md:text-lg">
                Encuentra esa botella especial y recíbela sin salir de casa.
                Selección honesta, entrega local y compra responsable.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/#catalogo"
                  className="rounded-full bg-[#d7a63e] px-6 py-3.5 text-sm font-bold text-[#1d211c] transition hover:bg-[#f1c35d]"
                >
                  Ver catálogo
                </Link>
                <Link
                  href="/cart"
                  className="rounded-full border border-white/25 px-6 py-3.5 text-sm font-bold transition hover:bg-white/10"
                >
                  Ir al carrito
                </Link>
              </div>
            </div>

            <div className="relative mx-auto hidden h-[480px] w-full max-w-lg lg:block">
              <div className="absolute inset-x-10 bottom-10 h-32 rounded-[50%] bg-black/25 blur-2xl" />
              <div className="absolute bottom-14 left-[42%] h-80 w-36 rotate-6 rounded-t-[4rem] rounded-b-3xl bg-[#6f1d2a] shadow-2xl">
                <div className="absolute -top-16 left-1/2 h-24 w-14 -translate-x-1/2 rounded-t-xl bg-[#232b25]" />
                <div className="absolute left-1/2 top-28 grid h-24 w-28 -translate-x-1/2 place-items-center bg-[#f5f1e8] text-center font-display text-xl font-bold text-[#6f1d2a]">
                  Reserva
                  <br />
                  24
                </div>
              </div>
              <div className="absolute bottom-14 left-[14%] h-64 w-28 -rotate-6 rounded-t-[3rem] rounded-b-2xl bg-[#b77d2d] shadow-2xl">
                <div className="absolute -top-12 left-1/2 h-20 w-12 -translate-x-1/2 rounded-t-lg bg-[#e0b759]" />
                <div className="absolute left-1/2 top-24 grid h-16 w-24 -translate-x-1/2 place-items-center bg-[#f5f1e8] font-display font-bold text-[#1d211c]">
                  Añejo
                </div>
              </div>
              <div className="absolute right-4 top-12 rounded-full border border-[#f1c35d]/50 px-5 py-3 text-center font-display text-sm italic text-[#f1c35d]">
                Entrega local
                <br />
                rápida
              </div>
            </div>
          </div>
        </section>

        <Catalog />

        <section id="beneficios" className="bg-[#e9e1d2]">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#6f1d2a]">
              Así de sencillo
            </p>
            <h2 className="font-display text-4xl font-bold md:text-5xl">
              De nuestra bodega a tu mesa
            </h2>
            <div className="mt-12 grid gap-px overflow-hidden rounded-[2rem] border border-black/10 bg-black/10 md:grid-cols-3">
              {benefits.map((benefit) => (
                <article key={benefit.number} className="bg-[#f5f1e8] p-8">
                  <span className="font-display text-4xl font-bold text-[#d7a63e]">
                    {benefit.number}
                  </span>
                  <h3 className="mt-8 font-display text-2xl font-bold">
                    {benefit.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-black/55">{benefit.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="rounded-[2.5rem] bg-[#6f1d2a] px-6 py-14 text-center text-white md:px-12">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f1c35d]">
              Compra responsable
            </p>
            <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-bold md:text-5xl">
              Buenos momentos, siempre con responsabilidad.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-white/65">
              Solo vendemos a mayores de 18 años. Al recibir tu pedido deberás
              presentar un documento de identidad válido.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
