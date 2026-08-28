import { NextResponse } from "next/server"
import { createOrder, type CreateOrderInput } from "@/lib/orders.service"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CreateOrderInput>

    if (!body.customerName || !body.document || !body.phone || !body.email || !body.address) {
      return NextResponse.json(
        { success: false, error: "Faltan datos obligatorios del pedido" },
        { status: 400 }
      )
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "El pedido debe incluir al menos un producto" },
        { status: 400 }
      )
    }

    const order = await createOrder({
      customerName: body.customerName,
      document: body.document,
      phone: body.phone,
      email: body.email,
      address: body.address,
      notes: body.notes,
      items: body.items,
    })

    return NextResponse.json({ success: true, data: order }, { status: 201 })
  } catch (error) {
    if (
      error instanceof Error &&
      ["Producto no encontrado", "Cantidad inválida", "Precio inválido", "Stock insuficiente"].includes(error.message)
    ) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "No se pudo procesar el pedido" },
      { status: 500 }
    )
  }
}
