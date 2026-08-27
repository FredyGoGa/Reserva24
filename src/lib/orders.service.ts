import { products } from "@/lib/products.mock"

export type OrderItem = {
  id: string
  name: string
  qty: number
  price: number
}

export type CreateOrderInput = {
  customerName: string
  document: string
  phone: string
  email: string
  address: string
  notes?: string
  items: OrderItem[]
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
  notes?: string
  items: OrderItem[]
  total: number
}

function buildOrderId() {
  return `ord-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createOrder(input: CreateOrderInput): Order {
  const orderItems = input.items.map((item) => {
    const product = products.find((candidate) => candidate.id === item.id)

    if (!product) {
      throw new Error("Producto no encontrado")
    }

    if (!Number.isInteger(item.qty) || item.qty <= 0) {
      throw new Error("Cantidad inválida")
    }

    if (item.price !== product.price) {
      throw new Error("Precio inválido")
    }

    return {
      id: product.id,
      name: product.name,
      qty: item.qty,
      price: product.price,
    }
  })

  const total = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0)

  return {
    id: buildOrderId(),
    status: "pending",
    createdAt: new Date().toISOString(),
    customerName: input.customerName,
    document: input.document,
    phone: input.phone,
    email: input.email,
    address: input.address,
    notes: input.notes,
    items: orderItems,
    total,
  }
}
