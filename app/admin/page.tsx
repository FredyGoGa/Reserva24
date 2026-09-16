"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { formatCOP } from "@/lib/pricing"
import { API_URL } from "@/lib/api-url"

type Product = {
  id: string
  name: string
  price: number
  category: string
  brand: string
  size: string
  description?: string | null
  accent: string
  featured: boolean
  stock: number
  active: boolean
}

type Order = {
  id: string
  customerName: string
  email: string
  document: string
  phone: string
  address: string
  status: string
  paymentStatus: string
  total: number
  createdAt: string
  items: Array<{ id: string; name: string; qty: number; price: number }>
}

type SessionUser = { id: string; email: string; name: string; role: "USER" | "ADMIN" }

type ProductDraft = {
  id: string
  name: string
  price: number
  category: string
  brand: string
  size: string
  description: string
  accent: string
  stock: number
  featured: boolean
}

const emptyProduct: ProductDraft = {
  id: "",
  name: "",
  price: 0,
  category: "Ron",
  brand: "",
  size: "750ml",
  description: "",
  accent: "#d4a733",
  stock: 0,
  featured: false,
}

export default function AdminPage() {
  const searchParams = useSearchParams()
  const authRequired = searchParams.get("auth") === "required"
  const [email, setEmail] = useState("admin@reserva24.local")
  const [password, setPassword] = useState("admin123")
  const [user, setUser] = useState<SessionUser | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [message, setMessage] = useState(authRequired ? "Inicia sesión para continuar." : "")
  const [tab, setTab] = useState<"overview" | "products" | "customers" | "orders">("overview")
  const [productForm, setProductForm] = useState<ProductDraft>(emptyProduct)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)

  const loadDashboard = useCallback(async () => {
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
  }, [])

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
    if (payload.data?.role === "ADMIN") await loadDashboard()
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
    if (response.ok) await loadDashboard()
  }

  async function handleProductSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const payload = {
      ...productForm,
      stock: Number(productForm.stock),
      price: Number(productForm.price),
      active: true,
    }

    const url = editingProductId ? `${API_URL}/api/products/${editingProductId}` : `${API_URL}/api/products`
    const method = editingProductId ? "PATCH" : "POST"

    const response = await fetch(url, {
      method,
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    })

    const result = await response.json()
    if (!response.ok) {
      setMessage(result.error ?? "No se pudo guardar el producto")
      return
    }

    setMessage(editingProductId ? "Producto actualizado" : "Producto creado")
    setProductForm(emptyProduct)
    setEditingProductId(null)
    await loadDashboard()
  }

  async function deleteProduct(productId: string) {
    const response = await fetch(`${API_URL}/api/products/${productId}`, {
      method: "DELETE",
      credentials: "include",
    })

    if (response.ok) {
      setMessage("Producto eliminado")
      await loadDashboard()
      return
    }

    const payload = await response.json()
    setMessage(payload.error ?? "No se pudo eliminar el producto")
  }

  function startEditProduct(product: Product) {
    setEditingProductId(product.id)
    setProductForm({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      brand: product.brand,
      size: product.size,
      description: product.description ?? "",
      accent: product.accent,
      stock: product.stock,
      featured: product.featured,
    })
    setTab("products")
  }

  useEffect(() => {
    let active = true

    void fetch(`${API_URL}/api/auth/session`, { credentials: "include" })
      .then(async (response) => response.ok ? (await response.json()).data as SessionUser | null : null)
      .then((session) => {
        if (!active || !session) return
        setUser(session)
        if (session.role === "ADMIN") void loadDashboard()
      })
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [loadDashboard])

  const stats = useMemo(() => {
    const transactions = orders.filter((order) => order.status === "confirmed" || order.status === "pending_payment")
    const revenue = transactions.reduce((sum, order) => sum + Number(order.total), 0)
    const pendingOrders = orders.filter((order) => order.status === "pending_payment").length
    const paidOrders = orders.filter((order) => order.status === "confirmed").length
    const cancelledOrders = orders.filter((order) => order.status === "cancelled").length
    const lowStock = products.filter((product) => product.stock <= 5)

    return {
      revenue,
      pendingOrders,
      paidOrders,
      cancelledOrders,
      lowStock: lowStock.length,
      totalProducts: products.length,
      totalCustomers: new Set(orders.map((order) => order.email)).size,
    }
  }, [orders, products])

  const customers = useMemo(() => {
    const grouped = new Map<string, { name: string; email: string; phone: string; document: string; totalSpent: number; orders: number }>()

    for (const order of orders) {
      const existing = grouped.get(order.email) ?? {
        name: order.customerName,
        email: order.email,
        phone: order.phone,
        document: order.document,
        totalSpent: 0,
        orders: 0,
      }

      existing.totalSpent += Number(order.total)
      existing.orders += 1
      grouped.set(order.email, existing)
    }

    return Array.from(grouped.values()).sort((a, b) => b.totalSpent - a.totalSpent)
  }, [orders])

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
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#6f1d2a]">Administración</p>
          <h1 className="mt-3 font-display text-4xl font-bold">Dashboard operativo</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-black/70">{user.email}</span>
          <button onClick={logout} className="rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-semibold">Cerrar sesión</button>
        </div>
      </div>

      {message && <p className="mt-4 text-sm text-[#6f1d2a]">{message}</p>}

      <div className="mt-8 flex flex-wrap gap-3">
        {[
          { key: "overview", label: "Resumen" },
          { key: "products", label: "Productos" },
          { key: "customers", label: "Clientes" },
          { key: "orders", label: "Pedidos" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key as typeof tab)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === item.key ? "bg-[#183c2c] text-white" : "border border-black/10 bg-white text-black"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <section className="mt-8 space-y-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-black/50">Ingresos</p>
              <h2 className="mt-4 text-3xl font-bold">{formatCOP(stats.revenue)}</h2>
            </article>
            <article className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-black/50">Pedidos pendientes</p>
              <h2 className="mt-4 text-3xl font-bold">{stats.pendingOrders}</h2>
            </article>
            <article className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-black/50">Pedidos pagados</p>
              <h2 className="mt-4 text-3xl font-bold">{stats.paidOrders}</h2>
            </article>
            <article className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-black/50">Stock bajo</p>
              <h2 className="mt-4 text-3xl font-bold">{stats.lowStock}</h2>
            </article>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
              <h3 className="font-display text-2xl font-bold">Resumen operativo</h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-black/10 bg-[#f7f3ea] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-black/50">Productos</p>
                  <p className="mt-3 text-2xl font-bold">{stats.totalProducts}</p>
                </div>
                <div className="rounded-xl border border-black/10 bg-[#f7f3ea] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-black/50">Clientes</p>
                  <p className="mt-3 text-2xl font-bold">{stats.totalCustomers}</p>
                </div>
                <div className="rounded-xl border border-black/10 bg-[#f7f3ea] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-black/50">Cancelados</p>
                  <p className="mt-3 text-2xl font-bold">{stats.cancelledOrders}</p>
                </div>
                <div className="rounded-xl border border-black/10 bg-[#f7f3ea] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-black/50">Línea</p>
                  <p className="mt-3 text-2xl font-bold">{products.length ? "Activa" : "Sin stock"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
              <h3 className="font-display text-2xl font-bold">Stock crítico</h3>
              <div className="mt-4 space-y-3">
                {products.filter((product) => product.stock <= 5).length ? (
                  products.filter((product) => product.stock <= 5).map((product) => (
                    <div key={product.id} className="flex items-center justify-between rounded-xl border border-[#d4a733]/40 bg-[#fff8e5] p-3">
                      <div>
                        <p className="font-bold">{product.name}</p>
                        <p className="text-xs text-black/50">{product.brand}</p>
                      </div>
                      <span className="rounded-full bg-[#d4a733] px-2 py-1 text-xs font-bold text-white">{product.stock}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-black/60">No hay productos con stock crítico.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {tab === "products" && (
        <section className="mt-8 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <h3 className="font-display text-2xl font-bold">{editingProductId ? "Editar producto" : "Crear producto"}</h3>
            <form onSubmit={handleProductSubmit} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input value={productForm.id} onChange={(event) => setProductForm((current) => ({ ...current, id: event.target.value }))} placeholder="ID del producto" className="rounded-xl border border-black/15 bg-white px-3 py-2" required />
                <input value={productForm.name} onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))} placeholder="Nombre" className="rounded-xl border border-black/15 bg-white px-3 py-2" required />
                <input type="number" value={productForm.price} onChange={(event) => setProductForm((current) => ({ ...current, price: Number(event.target.value) }))} placeholder="Precio" className="rounded-xl border border-black/15 bg-white px-3 py-2" required />
                <input type="number" value={productForm.stock} onChange={(event) => setProductForm((current) => ({ ...current, stock: Number(event.target.value) }))} placeholder="Stock" className="rounded-xl border border-black/15 bg-white px-3 py-2" required />
                <input value={productForm.category} onChange={(event) => setProductForm((current) => ({ ...current, category: event.target.value }))} placeholder="Categoría" className="rounded-xl border border-black/15 bg-white px-3 py-2" required />
                <input value={productForm.brand} onChange={(event) => setProductForm((current) => ({ ...current, brand: event.target.value }))} placeholder="Marca" className="rounded-xl border border-black/15 bg-white px-3 py-2" required />
                <input value={productForm.size} onChange={(event) => setProductForm((current) => ({ ...current, size: event.target.value }))} placeholder="Tamaño" className="rounded-xl border border-black/15 bg-white px-3 py-2" required />
                <input value={productForm.accent} onChange={(event) => setProductForm((current) => ({ ...current, accent: event.target.value }))} placeholder="Color / accent" className="rounded-xl border border-black/15 bg-white px-3 py-2" />
              </div>
              <textarea value={productForm.description} onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))} placeholder="Descripción" className="min-h-24 w-full rounded-xl border border-black/15 bg-white px-3 py-2" />
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={productForm.featured} onChange={(event) => setProductForm((current) => ({ ...current, featured: event.target.checked }))} />
                Destacado
              </label>
              <div className="flex gap-3">
                <button type="submit" className="rounded-full bg-[#183c2c] px-4 py-2 text-sm font-bold text-white">{editingProductId ? "Guardar cambios" : "Crear producto"}</button>
                {editingProductId && (
                  <button type="button" onClick={() => { setEditingProductId(null); setProductForm(emptyProduct) }} className="rounded-full border border-black/15 px-4 py-2 text-sm font-semibold">Cancelar</button>
                )}
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <h3 className="font-display text-2xl font-bold">Inventario</h3>
            <div className="mt-5 space-y-3">
              {products.map((product) => (
                <article key={product.id} className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-[#f7f3ea] p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-bold">{product.name}</p>
                    <p className="text-xs text-black/50">{product.brand} · {product.category} · {product.size}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold">Stock: {product.stock}</span>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold">{formatCOP(product.price)}</span>
                    <button onClick={() => startEditProduct(product)} className="rounded-full border border-black/15 px-3 py-1 text-sm">Editar</button>
                    <button onClick={() => void deleteProduct(product.id)} className="rounded-full border border-[#6f1d2a]/30 px-3 py-1 text-sm text-[#6f1d2a]">Eliminar</button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {tab === "customers" && (
        <section className="mt-8 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <h3 className="font-display text-2xl font-bold">Clientes</h3>
          <div className="mt-5 space-y-3">
            {customers.map((customer) => (
              <article key={customer.email} className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-[#f7f3ea] p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-bold">{customer.name}</p>
                  <p className="text-sm text-black/60">{customer.email} · {customer.phone}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold">Pedidos: {customer.orders}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold">Gastó: {formatCOP(customer.totalSpent)}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === "orders" && (
        <section className="mt-8 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <h3 className="font-display text-2xl font-bold">Pedidos</h3>
          <div className="mt-5 space-y-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-2xl border border-black/10 bg-[#f7f3ea] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-bold">{order.customerName}</p>
                    <p className="text-xs text-black/50">{order.id} · {order.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase">{order.status}</span>
                    <p className="font-bold">{formatCOP(order.total)}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-black/60">
                    {order.items.map((item) => `${item.name} x${item.qty}`).join(" · ") || "Sin items"}
                  </div>
                  <select value={order.status} onChange={(event) => void updateOrder(order.id, event.target.value)} className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm">
                    <option value="pending_payment">Pendiente de pago</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
