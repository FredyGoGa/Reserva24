import { NextResponse } from "next/server"
import { createProduct, getProducts, type ProductInput } from "@/lib/products.service"
import { isAdminRequest } from "@/lib/admin-auth"

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: await getProducts(),
    })
  } catch {
    return NextResponse.json(
      { success: false, error: "No se pudo conectar con la base de datos" },
      { status: 503 }
    )
  }
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = (await request.json()) as ProductInput
    if (!body.id || !body.name || !body.price || !body.category || !body.brand || !body.size) {
      return NextResponse.json({ success: false, error: "Faltan datos del producto" }, { status: 400 })
    }
    if (!Number.isInteger(body.price) || body.price <= 0 || !Number.isInteger(body.stock ?? 0) || (body.stock ?? 0) < 0) {
      return NextResponse.json({ success: false, error: "Precio o stock inválido" }, { status: 400 })
    }
    return NextResponse.json({ success: true, data: await createProduct(body) }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, error: "No se pudo crear el producto" }, { status: 500 })
  }
}
