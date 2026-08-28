import { NextResponse } from "next/server"
import { deleteProduct, getProductById, updateProduct, type ProductInput } from "@/lib/products.service"

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
  const product = await updateProduct((await params).id, (await request.json()) as Partial<ProductInput>)
  if (!product) return NextResponse.json({ success: false, error: "Producto no encontrado" }, { status: 404 })
  return NextResponse.json({ success: true, data: product })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const deleted = await deleteProduct((await params).id)
  if (!deleted) return NextResponse.json({ success: false, error: "Producto no encontrado" }, { status: 404 })
  return NextResponse.json({ success: true })
}
