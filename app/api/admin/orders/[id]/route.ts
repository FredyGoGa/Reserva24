import { NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/admin-auth"
import { updateOrderStatus } from "@/lib/orders.service"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
  }

  const body = (await request.json()) as { status?: "pending" | "paid" | "cancelled" }
  if (!body.status || !["pending", "paid", "cancelled"].includes(body.status)) {
    return NextResponse.json({ success: false, error: "Estado inválido" }, { status: 400 })
  }

  try {
    const order = await updateOrderStatus((await params).id, body.status)
    if (!order) return NextResponse.json({ success: false, error: "Pedido no encontrado" }, { status: 404 })
    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    if (error instanceof Error && error.message === "Transición de estado no permitida") {
      return NextResponse.json({ success: false, error: error.message }, { status: 409 })
    }
    return NextResponse.json({ success: false, error: "No se pudo actualizar el pedido" }, { status: 500 })
  }
}