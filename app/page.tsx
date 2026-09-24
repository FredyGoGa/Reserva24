import Link from "next/link"
import Catalog from "@/components/Catalog"
import Footer from "@/components/Footer"
import NavBar from "@/components/NavBar"
import ProductVisual from "@/components/ProductVisual"
import { products } from "@/lib/products.mock"

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

const categoryHighlights = [
  { label: "Whisky", note: "Carácter y profundidad", accent: "#b6282f" },
  { label: "Vinos", note: "Para una mesa especial", accent: "#762b36" },
  { label: "Cervezas", note: "Frescas para compartir", accent: "#d3a13a" },
  { label: "Gin & coctelería", note: "Eleva la noche", accent: "#1e704f" },
]

export default function Home() {
  return (
    <>
      <NavBar />
      <main>
        <section className="grain relative overflow-hidden bg-[#174737] text-white">
          <div className="absolute -right-28 -top-36 size-[30rem] rounded-full border border-white/10" />
          <div className="absolute -bottom-64 right-10 size-[36rem] rounded-full border border-[#d3a13a]/20" />
          <div className="relative mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
            <div className="reveal-up">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-[#f1c35d]">
                Bodega 24 / Facatativá
              </p>
              <h1 className="max-w-3xl font-display text-5xl font-bold leading-[0.94] sm:text-6xl lg:text-8xl">
                Tu próxima buena historia empieza aquí.
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/68 md:text-lg">
                Licores seleccionados para compartir, celebrar o regalar. Compra
                fácil, entrega local y la confianza de una bodega que conoce su ciudad.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/#catalogo"
                  className="rounded-full bg-[#d3a13a] px-6 py-3.5 text-sm font-bold text-[#18231d] shadow-[0_12px_25px_rgba(0,0,0,.14)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#f1c35d]"
                >
                  Explorar la selección
                </Link>
                <Link
                  href="/cart"
                  className="rounded-full border border-white/25 px-6 py-3.5 text-sm font-bold transition duration-300 hover:-translate-y-0.5 hover:bg-white/10"
                >
                  Ver mi carrito
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-5 text-xs text-white/55">
                <span><strong className="text-white">18+</strong> compra responsable</span>
                <span className="size-1 rounded-full bg-[#d3a13a]" />
                <span><strong className="text-white">Local</strong> entregas en Facatativá</span>
              </div>
            </div>

            <div className="reveal-up reveal-delay-2 relative mx-auto hidden h-[480px] w-full max-w-lg lg:block">
              <div className="absolute inset-x-10 bottom-10 h-32 rounded-[50%] bg-black/25 blur-2xl" />
              <div className="absolute bottom-14 left-[42%] h-80 w-36 rotate-6 rounded-t-[4rem] rounded-b-3xl bg-[#6f1d2a] shadow-2xl">
                <div className="absolute -top-16 left-1/2 h-24 w-14 -translate-x-1/2 rounded-t-xl bg-[#232b25]" />
                <div className="absolute left-1/2 top-28 grid h-24 w-28 -translate-x-1/2 place-items-center bg-[#f3efe5] text-center font-display text-xl font-bold text-[#762b36]">
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
              <div className="absolute right-4 top-12 rotate-6 rounded-2xl border border-[#f1c35d]/50 bg-[#174737]/70 px-5 py-3 text-center font-display text-sm italic text-[#f1c35d] shadow-xl backdrop-blur-sm">
                Selección
                <br />
                con intención
              </div>
            </div>
          </div>
        </section>

        <section className="relative -mt-10 z-10 mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid overflow-hidden rounded-[1.75rem] border border-black/10 bg-white shadow-[0_22px_60px_rgba(24,35,29,.1)] sm:grid-cols-2 lg:grid-cols-4">
            {categoryHighlights.map((item) => (
              <Link key={item.label} href={`/#catalogo`} className="group flex items-center gap-4 border-b border-black/10 p-5 transition hover:bg-[#f3efe5] sm:nth-[odd]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl text-sm font-bold text-white shadow-inner" style={{ backgroundColor: item.accent }}>
                  {item.label.slice(0, 2).toUpperCase()}
                </span>
                <span>
                  <strong className="block font-display text-lg leading-none">{item.label}</strong>
                  <span className="mt-1 block text-xs text-black/45">{item.note}</span>
                </span>
                <span className="ml-auto text-lg text-[#174737] transition group-hover:translate-x-1">→</span>
              </Link>
            ))}
          </div>
        </section>

        <Catalog />

        <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] bg-[#102f43] text-white shadow-[0_24px_70px_rgba(16,47,67,.18)]">
            <div className="grid items-center gap-8 px-7 py-10 md:grid-cols-[.8fr_1.2fr] md:px-12 md:py-14">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#d3a13a]">Selección del mes</p>
                <h2 className="mt-4 max-w-md font-display text-4xl font-bold leading-[.98] md:text-5xl">Una botella para cada tipo de celebración.</h2>
                <p className="mt-5 max-w-sm text-sm leading-6 text-white/60">Descubre favoritos de la casa, precios honestos y opciones listas para regalar.</p>
                <Link href="/#catalogo" className="mt-7 inline-flex rounded-full bg-[#d3a13a] px-5 py-3 text-sm font-bold text-[#18231d] transition hover:-translate-y-0.5 hover:bg-[#f1c35d]">Ver recomendados <span className="ml-3">→</span></Link>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {products.filter((product) => product.featured).slice(0, 4).map((product) => (
                  <Link key={product.id} href="/#catalogo" className="group rounded-2xl bg-white/10 p-2 backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/15">
                    <ProductVisual name={product.name} accent={product.accent} compact />
                    <p className="mt-3 line-clamp-2 px-1 text-xs font-bold text-white/85">{product.name}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

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
