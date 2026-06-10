import CheckoutForm from "@/components/CheckoutForm"
import Footer from "@/components/Footer"
import NavBar from "@/components/NavBar"

export default function CheckoutPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto min-h-[70vh] max-w-7xl px-5 py-14 lg:px-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#6f1d2a]">
          Último paso
        </p>
        <h1 className="mb-10 font-display text-4xl font-bold md:text-5xl">
          Finalizar compra
        </h1>
        <CheckoutForm />
      </main>
      <Footer />
    </>
  )
}
