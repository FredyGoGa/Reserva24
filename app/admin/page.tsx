"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { formatCOP } from "@/lib/pricing"
import { API_URL } from "@/lib/api-url"

type Product = { id: string; name: string; price: number; stock: number; active: boolean }
type Order = { id: string; customerName: string; status: string; total: number; createdAt: string }
type SessionUser = { id: string; email: string; name: string; role: "USER" | "ADMIN" }

export default function AdminPage() {
  const searchParams = useSearchParams()
  const authRequired = searchParams.get("auth") === "required"
  const [email, setEmail] = useState("admin@reserva24.local")
  const [password, setPassword] = useState("admin123")
  const [user, setUser] = useState<SessionUser | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [message, setMessage] = useState(authRequired ? "Inicia sesión para continuar." : "")

  async function loadSession() {
    const response = await fetch(`${API_URL}/api/auth/session`, { credentials: "include" })
    if (!response.ok) {
      setUser(null)
      return
    }

    const payload = await response.json()
    setUser(payload.data ?? null)
  }

  async function load() {
    if (!user || user.role !== "ADMIN") {
      return
    }

    const [productsResponse, ordersResponse] = await Promise.all([
      fetch(`${API_URL}/api/products`, { credentials: "include" }),
      fetch(`${API_URL}/api/admin/orders`, { credentials: "include" }),
    ])

    if (!ordersResponse.ok) {
      setMessage("La sesión no es válida o no tienes permisos de administrador")
      return
    }

    setProducts((await productsResponse.json()).data ?? [])
    setOrders((await ordersResponse.json()).data ?? [])
    setMessage("")
  }

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")

    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const payload = await response.json()
    if (!response.ok) {
      setMessage(payload.error ?? "No se pudo iniciar sesión")
      return
    }

    setUser(payload.data)
    setMessage("")
  }

  async function logout() {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    })
    setUser(null)
    setProducts([])
    setOrders([])
    setMessage("Sesión cerrada")
  }

  async function updateOrder(id: string, status: string) {
    const response = await fetch(`${API_URL}/api/admin/orders/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (response.ok) await load()
  }

  async function updateStock(id: string, stock: number) {
    const response = await fetch(`${API_URL}/api/products/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stock }),
    })
    if (response.ok) await load()
  }

  useEffect(() => {
    void fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => undefined)
    setUser(null)
    setProducts([])
    setOrders([])
  }, [])

  useEffect(() => {
    if (user && user.role === "ADMIN") {
      void load()
    }
  }, [user])

  if (!user) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-12 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#6f1d2a]">Administración</p>
        <h1 className="mt-3 font-display text-4xl font-bold">Inicia sesión</h1>
        {authRequired && <p className="mt-3 text-sm text-[#6f1d2a]">Necesitas una sesión válida para entrar al panel administrativo.</p>}
        <form onSubmit={login} className="mt-8 space-y-4 rounded-2xl border border-black/10 bg-white p-6">
          <label className="block text-sm font-medium text-black/70">
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3" />
          </label>
          <label className="block text-sm font-medium text-black/70">
            Contraseña
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3" />
          </label>
          <button className="w-full rounded-full bg-[#183c2c] px-5 py-3 text-sm font-bold text-white">Entrar</button>
        </form>
        {message && <p className="mt-4 text-sm text-[#6f1d2a]">{message}</p>}
      </main>
    )
  }

  if (user.role !== "ADMIN") {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-12 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#6f1d2a]">Administración</p>
        <h1 className="mt-3 font-display text-4xl font-bold">Acceso restringido</h1>
        <p className="mt-4 text-black/70">Este panel solo está disponible para usuarios con rol administrador.</p>
        <button onClick={logout} className="mt-6 rounded-full bg-[#183c2c] px-5 py-3 text-sm font-bold text-white">Cerrar sesión</button>
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-12 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#6f1d2a]">Administración</p>
          <h1 className="mt-3 font-display text-4xl font-bold">Pedidos e inventario</h1>
        </div>
        <button onClick={logout} className="rounded-full border border-black/15 px-4 py-2 text-sm font-semibold">Cerrar sesión</button>
      </div>

      <p className="mt-4 text-sm text-black/60">Sesión activa para {user.name || user.email}</p>
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