import dotenv from "dotenv"
import cors from "cors"
import express, { type Request, type Response, type NextFunction } from "express"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { createSessionToken, getAdminSession, hashPassword, verifyPassword } from "@/lib/auth"
import { createProduct, deleteProduct, getProductById, getProducts, updateProduct, type ProductInput } from "@/lib/products.service"
import { createOrder, getOrders, updateOrderStatus, type CreateOrderInput } from "@/lib/orders.service"

dotenv.config({ path: ".env.local" })
dotenv.config()

const app = express()
const port = Number(process.env.BACKEND_PORT ?? 4000)
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000"

app.use(cors({ origin: frontendOrigin, credentials: true }))
app.use(express.json({ limit: "1mb" }))

app.get("/.well-known/appspecific/com.chrome.devtools.json", (_request, response) => {
  response.status(204).end()
})

app.get("/", (_request, response) => {
  response.json({
    success: true,
    service: "reserva24-api",
    message: "Backend activo. Consulta /health para verificar el servicio.",
  })
})

function adminOnly(request: Request, response: Response, next: NextFunction) {
  const session = getAdminSession(request)
  if (!session) {
    response.status(401).json({ success: false, error: "No autorizado" })
    return
  }
  next()
}

function isKnownOrderError(error: unknown) {
  return error instanceof Error && [
    "Producto no encontrado",
    "Cantidad inválida",
    "Stock insuficiente",
    "Transición de estado no permitida",
  ].includes(error.message)
}

function routeParam(value: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

app.get("/health", (_request, response) => {
  response.json({ success: true, service: "reserva24-api" })
})

app.get("/api/auth/session", async (request, response) => {
  const session = getAdminSession(request)
  if (!session) {
    response.status(401).json({ success: false, error: "No autorizado" })
    return
  }

  const user = await prisma.user.findUnique({ where: { id: session.sub }, select: { id: true, email: true, name: true, role: true } })
  if (!user) {
    response.status(401).json({ success: false, error: "No autorizado" })
    return
  }

  response.json({ success: true, data: user })
})

app.post("/api/auth/login", async (request, response) => {
  const { email, password } = request.body as { email?: string; password?: string }

  if (!email || !password) {
    response.status(400).json({ success: false, error: "Email y contraseña obligatorios" })
    return
  }

  const normalizedEmail = String(email).trim().toLowerCase()
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (!user || !(await verifyPassword(String(password), user.passwordHash))) {
    response.status(401).json({ success: false, error: "Credenciales inválidas" })
    return
  }

  const token = createSessionToken({ sub: user.id, email: user.email, role: user.role })
  response.cookie("reserva24_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })

  response.json({
    success: true,
    data: { id: user.id, email: user.email, name: user.name, role: user.role },
  })
})

app.post("/api/auth/logout", (_request, response) => {
  response.clearCookie("reserva24_session", { path: "/" })
  response.json({ success: true })
})

app.get("/api/products", async (_request, response) => {
  try {
    response.json({ success: true, data: await getProducts() })
  } catch {
    response.status(503).json({ success: false, error: "No se pudo conectar con la base de datos" })
  }
})

app.get("/api/products/:id", async (request, response) => {
  const product = await getProductById(routeParam(request.params.id))
  if (!product) {
    response.status(404).json({ success: false, error: "Producto no encontrado" })
    return
  }
  response.json({ success: true, data: product })
})

app.post("/api/products", adminOnly, async (request, response) => {
  try {
    const body = request.body as ProductInput
    if (!body.id || !body.name || !body.price || !body.category || !body.brand || !body.size) {
      response.status(400).json({ success: false, error: "Faltan datos del producto" })
      return
    }
    if (!Number.isInteger(body.price) || body.price <= 0 || !Number.isInteger(body.stock ?? 0) || (body.stock ?? 0) < 0) {
      response.status(400).json({ success: false, error: "Precio o stock inválido" })
      return
    }
    response.status(201).json({ success: true, data: await createProduct(body) })
  } catch {
    response.status(500).json({ success: false, error: "No se pudo crear el producto" })
  }
})

app.patch("/api/products/:id", adminOnly, async (request, response) => {
  const body = request.body as Partial<ProductInput>
  if (body.price !== undefined && (!Number.isInteger(body.price) || body.price <= 0)) {
    response.status(400).json({ success: false, error: "Precio inválido" })
    return
  }
  if (body.stock !== undefined && (!Number.isInteger(body.stock) || body.stock < 0)) {
    response.status(400).json({ success: false, error: "Stock inválido" })
    return
  }
  const product = await updateProduct(routeParam(request.params.id), body)
  if (!product) {
    response.status(404).json({ success: false, error: "Producto no encontrado" })
    return
  }
  response.json({ success: true, data: product })
})

app.delete("/api/products/:id", adminOnly, async (request, response) => {
  const deleted = await deleteProduct(routeParam(request.params.id))
  if (!deleted) {
    response.status(404).json({ success: false, error: "Producto no encontrado" })
    return
  }
  response.json({ success: true })
})

app.post("/api/orders", async (request, response) => {
  try {
    const body = request.body as CreateOrderInput
    if (!body.customerName || !body.document || !body.phone || !body.email || !body.address) {
      response.status(400).json({ success: false, error: "Faltan datos obligatorios del pedido" })
      return
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      response.status(400).json({ success: false, error: "El pedido debe incluir al menos un producto" })
      return
    }
    response.status(201).json({ success: true, data: await createOrder(body) })
  } catch (error) {
    response.status(isKnownOrderError(error) ? 400 : 500).json({
      success: false,
      error: error instanceof Error && isKnownOrderError(error) ? error.message : "No se pudo procesar el pedido",
    })
  }
})

app.get("/api/admin/orders", adminOnly, async (_request, response) => {
  response.json({ success: true, data: await getOrders() })
})

app.patch("/api/admin/orders/:id", adminOnly, async (request, response) => {
  const status = request.body?.status as "pending" | "paid" | "cancelled" | undefined
  if (!status || !["pending", "paid", "cancelled"].includes(status)) {
    response.status(400).json({ success: false, error: "Estado inválido" })
    return
  }
  try {
    const order = await updateOrderStatus(routeParam(request.params.id), status)
    if (!order) {
      response.status(404).json({ success: false, error: "Pedido no encontrado" })
      return
    }
    response.json({ success: true, data: order })
  } catch (error) {
    response.status(isKnownOrderError(error) ? 409 : 500).json({
      success: false,
      error: error instanceof Error ? error.message : "No se pudo actualizar el pedido",
    })
  }
})

app.listen(port, "0.0.0.0", () => {
  console.log(`Reserva24 API escuchando en http://localhost:${port}`)
})