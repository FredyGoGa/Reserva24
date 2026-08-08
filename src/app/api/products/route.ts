import { NextResponse } from "next/server"
import { getProducts } from "@/lib/products.service"

export async function GET() {
  return NextResponse.json({
    success: true,
    data: getProducts(),
  })
}
