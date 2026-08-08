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
  const total = input.items.reduce((sum, item) => sum + item.price * item.qty, 0)

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
    items: input.items,
    total,
  }
}
