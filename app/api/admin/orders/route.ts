import { NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/admin-auth"
import { getOrders } from "@/lib/orders.service"

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
  }

  return NextResponse.json({ success: true, data: await getOrders() })
}