import { NextResponse } from "next/server"
import { deleteProduct, getProductById, updateProduct, type ProductInput } from "@/lib/products.service"
import { isAdminRequest } from "@/lib/admin-auth"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    return NextResponse.json(
      { success: false, error: "Producto no encontrado" },
      { status: 404 }
    )
  }

  return NextResponse.json({ success: true, data: product })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const body = (await request.json()) as Partial<ProductInput>
  if (body.price !== undefined && (!Number.isInteger(body.price) || body.price <= 0)) {
    return NextResponse.json({ success: false, error: "Precio inválido" }, { status: 400 })
  }
  if (body.stock !== undefined && (!Number.isInteger(body.stock) || body.stock < 0)) {
    return NextResponse.json({ success: false, error: "Stock inválido" }, { status: 400 })
  }
  const product = await updateProduct(id, body)
  if (!product) return NextResponse.json({ success: false, error: "Producto no encontrado" }, { status: 404 })
  return NextResponse.json({ success: true, data: product })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(_request)) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
  }

  const deleted = await deleteProduct((await params).id)
  if (!deleted) return NextResponse.json({ success: false, error: "Producto no encontrado" }, { status: 404 })
  return NextResponse.json({ success: true })
}
