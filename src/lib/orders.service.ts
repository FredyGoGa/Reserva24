import { prisma } from "@/lib/prisma"

export type OrderItem = {
  id: string
  name: string
  qty: number
  price: number
}

type CreateOrderItem = Pick<OrderItem, "id" | "qty">

export type CreateOrderInput = {
  customerName: string
  document: string
  phone: string
  email: string
  address: string
  notes?: string | null
  items: CreateOrderItem[]
}

export type Order = {
  id: string
  status: "pending" | "paid" | "cancelled"
  createdAt: string
  customerName: string
  document: string
  phone: string
  email: string
  address: string
  notes?: string | null
  items: OrderItem[]
  total: number
}

function buildOrderId() {
  return `ord-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  return prisma.$transaction(async (transaction) => {
    const orderItems = []

    for (const item of input.items) {
      if (!Number.isInteger(item.qty) || item.qty <= 0) throw new Error("Cantidad inválida")
      const product = await transaction.product.findUnique({ where: { id: item.id } })
      if (!product || !product.active) throw new Error("Producto no encontrado")
      if (product.stock < item.qty) throw new Error("Stock insuficiente")

      orderItems.push({
        productId: product.id,
        name: product.name,
        qty: item.qty,
        unitPrice: product.price,
        subtotal: product.price * item.qty,
      })
    }

    const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0)
    const order = await transaction.order.create({
      data: {
        id: buildOrderId(),
        customerName: input.customerName,
        document: input.document,
        phone: input.phone,
        email: input.email,
        address: input.address,
        notes: input.notes,
        total,
        items: { create: orderItems },
      },
      include: { items: true },
    })

    for (const item of orderItems) {
      const updated = await transaction.product.updateMany({
        where: { id: item.productId, stock: { gte: item.qty } },
        data: { stock: { decrement: item.qty } },
      })
      if (updated.count !== 1) throw new Error("Stock insuficiente")
    }

    return {
      ...order,
      status: order.status.toLowerCase() as Order["status"],
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        id: item.productId,
        name: item.name,
        qty: item.qty,
        price: item.unitPrice,
      })),
    }
  })
}

export async function getOrders() {
  return prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function updateOrderStatus(id: string, status: "pending" | "paid" | "cancelled") {
  return prisma.$transaction(async (transaction) => {
    const order = await transaction.order.findUnique({ where: { id }, include: { items: true } })
    if (!order) return undefined
    if (order.status.toLowerCase() === status) return order
    if (order.status !== "PENDING") throw new Error("Transición de estado no permitida")

    if (status === "cancelled") {
      for (const item of order.items) {
        await transaction.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.qty } },
        })
      }
    }

    return transaction.order.update({
      where: { id },
      data: { status: status.toUpperCase() as "PENDING" | "PAID" | "CANCELLED" },
      include: { items: true },
    })
  })
}
