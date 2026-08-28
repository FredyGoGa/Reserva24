import { NextResponse } from "next/server"
import { createProduct, getProducts, type ProductInput } from "@/lib/products.service"

export async function GET() {
  return NextResponse.json({
    success: true,
    data: await getProducts(),
  })
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProductInput
    if (!body.id || !body.name || !body.price || !body.category || !body.brand || !body.size) {
      return NextResponse.json({ success: false, error: "Faltan datos del producto" }, { status: 400 })
    }
    return NextResponse.json({ success: true, data: await createProduct(body) }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, error: "No se pudo crear el producto" }, { status: 500 })
  }
}
