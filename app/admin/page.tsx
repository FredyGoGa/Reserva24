"use client"

import { useState } from "react"
import { formatCOP } from "@/lib/pricing"
import { API_URL } from "@/lib/api-url"

type Product = { id: string; name: string; price: number; stock: number; active: boolean }
type Order = { id: string; customerName: string; status: string; total: number; createdAt: string }

export default function AdminPage() {
  const [token, setToken] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [message, setMessage] = useState("")

  async function load() {
    const headers = { "x-admin-token": token }
    const [productsResponse, ordersResponse] = await Promise.all([
      fetch(`${API_URL}/api/products`),
      fetch(`${API_URL}/api/admin/orders`, { headers }),
    ])
    if (!ordersResponse.ok) {
      setMessage("Token inválido o administración no configurada")
      return
    }
    setProducts((await productsResponse.json()).data ?? [])
    setOrders((await ordersResponse.json()).data ?? [])
  }

  async function saveToken(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    window.localStorage.setItem("reserva24-admin-token", token)
    setMessage("")
    await load()
  }

  async function updateOrder(id: string, status: string) {
    const response = await fetch(`${API_URL}/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-admin-token": token },
      body: JSON.stringify({ status }),
    })
    if (response.ok) await load()
  }

  async function updateStock(id: string, stock: number) {
    const response = await fetch(`${API_URL}/api/products/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-admin-token": token },
      body: JSON.stringify({ stock }),
    })
    if (response.ok) await load()
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-12 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#6f1d2a]">Administración</p>
      <h1 className="mt-3 font-display text-4xl font-bold">Pedidos e inventario</h1>
      <form onSubmit={saveToken} className="mt-8 flex max-w-xl gap-3">
        <input value={token} onChange={(event) => setToken(event.target.value)} type="password" placeholder="Token administrador" className="min-w-0 flex-1 rounded-xl border border-black/15 bg-white px-4 py-3" />
        <button className="rounded-full bg-[#183c2c] px-5 py-3 text-sm font-bold text-white">Entrar</button>
      </form>
      {message && <p className="mt-4 text-sm text-[#6f1d2a]">{message}</p>}
      <section className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h2 className="font-display text-2xl font-bold">Pedidos</h2>
          <div className="mt-4 space-y-3">
            {orders.map((order) => (
              <article key={order.id} className="rounded-2xl border border-black/10 bg-white p-5">
                <div className="flex flex-wrap justify-between gap-3">
                  <div><p className="font-bold">{order.customerName}</p><p className="text-xs text-black/50">{order.id}</p></div>
                  <p className="font-bold">{formatCOP(order.total)}</p>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-xs uppercase text-black/50">{order.status}</span>
                  <select value={order.status} onChange={(event) => updateOrder(order.id, event.target.value)} className="rounded-lg border border-black/15 px-3 py-2 text-sm">
                    <option value="pending">Pendiente</option><option value="paid">Pagado</option><option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold">Productos y stock</h2>
          <div className="mt-4 space-y-3">
            {products.map((product) => (
              <article key={product.id} className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white p-4">
                <div><p className="text-sm font-bold">{product.name}</p><p className="text-xs text-black/50">{formatCOP(product.price)}</p></div>
                <input aria-label={`Stock de ${product.name}`} type="number" min="0" value={product.stock} onChange={(event) => updateStock(product.id, Number(event.target.value))} className="w-20 rounded-lg border border-black/15 px-3 py-2 text-center" />
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}