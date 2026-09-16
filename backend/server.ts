import dotenv from "dotenv"
import cors from "cors"
import express, { type Request, type Response, type NextFunction } from "express"
import { prisma } from "@/lib/prisma"
import { createSessionToken, getAdminSession, getSessionTtlSeconds, verifyPassword } from "@/lib/auth"
import { assertBackendConfiguration, rateLimit, requireFrontendOrigin, securityHeaders } from "@/lib/backend-security"
import { createProduct, deleteProduct, getProductById, getProducts, updateProduct, type ProductInput } from "@/lib/products.service"
import { createOrder, getOrders, updateOrderStatus, type CreateOrderInput } from "@/lib/orders.service"
import { completeSandboxPayment, createCheckoutPreference, paymentMode, synchronizeMercadoPagoPayment, verifyMercadoPagoSignature } from "@/lib/payments.service"

dotenv.config({ path: ".env.local" })
dotenv.config()

assertBackendConfiguration()

const app = express()
const port = Number(process.env.BACKEND_PORT ?? 4000)
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000"

if (process.env.NODE_ENV === "production") app.set("trust proxy", 1)
app.disable("x-powered-by")
app.use(cors({ origin: frontendOrigin, credentials: true }))
app.use(express.json({ limit: "1mb" }))
app.use(securityHeaders)

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

app.get("/health", async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    response.json({ success: true, service: "reserva24-api", database: "connected" })
  } catch {
    response.status(503).json({ success: false, service: "reserva24-api", database: "unavailable" })
  }
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

app.post("/api/auth/login", requireFrontendOrigin(frontendOrigin), rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  key: (request) => `${request.ip ?? "unknown"}:${String(request.body?.email ?? "").trim().toLowerCase()}`,
}), async (request, response) => {
  try {
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
      maxAge: getSessionTtlSeconds() * 1000,
      path: "/",
    })

    response.json({
      success: true,
      data: { id: user.id, email: user.email, name: user.name, role: user.role },
    })
  } catch {
    response.status(503).json({ success: false, error: "No se pudo conectar con la base de datos" })
  }
})

app.post("/api/auth/logout", requireFrontendOrigin(frontendOrigin), (_request, response) => {
  response.clearCookie("reserva24_session", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  })
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

app.post("/api/products", requireFrontendOrigin(frontendOrigin), adminOnly, async (request, response) => {
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

app.patch("/api/products/:id", requireFrontendOrigin(frontendOrigin), adminOnly, async (request, response) => {
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

app.delete("/api/products/:id", requireFrontendOrigin(frontendOrigin), adminOnly, async (request, response) => {
  const deleted = await deleteProduct(routeParam(request.params.id))
  if (!deleted) {
    response.status(404).json({ success: false, error: "Producto no encontrado" })
    return
  }
  response.json({ success: true })
})

app.post("/api/orders", requireFrontendOrigin(frontendOrigin), rateLimit({ windowMs: 60 * 1000, max: 10 }), async (request, response) => {
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

app.post("/api/payments/preference", requireFrontendOrigin(frontendOrigin), rateLimit({ windowMs: 60 * 1000, max: 10 }), async (request, response) => {
  try {
    const orderId = String(request.body?.orderId ?? "")
    if (!orderId) {
      response.status(400).json({ success: false, error: "Falta el identificador de la orden" })
      return
    }
    const preference = await createCheckoutPreference(orderId)
    if (!preference) {
      response.status(404).json({ success: false, error: "Pedido no encontrado" })
      return
    }
    response.status(201).json({ success: true, mode: paymentMode(), data: preference })
  } catch (error) {
    response.status(502).json({ success: false, error: error instanceof Error ? error.message : "No se pudo iniciar el pago" })
  }
})

app.post("/api/payments/sandbox/complete", requireFrontendOrigin(frontendOrigin), async (request, response) => {
  if (paymentMode() !== "sandbox") {
    response.status(404).json({ success: false, error: "Sandbox desactivado" })
    return
  }

  const orderId = String(request.body?.orderId ?? "")
  const status = request.body?.status as "approved" | "rejected" | "pending" | undefined
  if (!orderId || !status || !["approved", "rejected", "pending"].includes(status)) {
    response.status(400).json({ success: false, error: "Orden o estado de sandbox inválido" })
    return
  }

  try {
    const order = await completeSandboxPayment(orderId, status)
    if (!order) {
      response.status(404).json({ success: false, error: "Pedido no encontrado" })
      return
    }
    response.json({ success: true, data: order })
  } catch (error) {
    response.status(400).json({ success: false, error: error instanceof Error ? error.message : "No se pudo completar el sandbox" })
  }
})

app.post("/api/payments/webhook", async (request, response) => {
  const dataId = String(request.query["data.id"] ?? request.body?.data?.id ?? "")
  if (!dataId || !verifyMercadoPagoSignature(request.get("x-signature"), request.get("x-request-id"), dataId)) {
    response.status(401).json({ success: false, error: "Firma de webhook inválida" })
    return
  }

  try {
    await synchronizeMercadoPagoPayment(dataId)
    response.status(200).json({ success: true })
  } catch {
    response.status(500).json({ success: false, error: "No se pudo sincronizar el pago" })
  }
})

app.get("/api/admin/orders", adminOnly, async (_request, response) => {
  response.json({ success: true, data: await getOrders() })
})

app.patch("/api/admin/orders/:id", requireFrontendOrigin(frontendOrigin), adminOnly, async (request, response) => {
  const status = request.body?.status as "pending_payment" | "confirmed" | "cancelled" | undefined
  if (!status || !["pending_payment", "confirmed", "cancelled"].includes(status)) {
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

app.use((_error: unknown, _request: Request, response: Response, next: NextFunction) => {
  void next
  response.status(500).json({ success: false, error: "Ocurrió un error inesperado" })
})

app.listen(port, "0.0.0.0", () => {
  console.log(`Reserva24 API escuchando en http://localhost:${port}`)
})
