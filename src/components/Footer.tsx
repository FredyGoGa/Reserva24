import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-[#121d17] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-3 lg:px-8">
        <div>
          <p className="font-display text-2xl font-bold text-[#f1c35d]">Bodega 24</p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-white/60">
            Tu licorería local, con selección cuidada y entregas responsables.
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-bold text-white/90">Explora</p>
          <Link href="/#catalogo" className="block py-1 text-white/60 hover:text-white">
            Catálogo
          </Link>
          <Link href="/cart" className="block py-1 text-white/60 hover:text-white">
            Carrito
          </Link>
        </div>
        <div className="text-sm text-white/60">
          <p className="mb-3 font-bold text-white/90">Compra responsable</p>
          <p className="leading-6">
            Prohibida la venta de bebidas alcohólicas a menores de edad. Se
            solicitará documento al entregar.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-white/40">
        © 2026 Bodega 24. Todos los derechos reservados.
      </div>
    </footer>
  )
}
