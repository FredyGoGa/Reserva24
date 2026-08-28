import { prisma } from "@/lib/prisma"

export type ProductApiItem = {
  id: string
  name: string
  price: number
  category: string
  brand: string
  size: string
  description?: string | null
  accent: string
  featured: boolean
  stock: number
  active: boolean
}

export async function getProducts(): Promise<ProductApiItem[]> {
  return prisma.product.findMany({ where: { active: true }, orderBy: { name: "asc" } })
}

export async function getProductById(id: string): Promise<ProductApiItem | undefined> {
  const product = await prisma.product.findFirst({ where: { id, active: true } })
  return product ?? undefined
}

export type ProductInput = Omit<ProductApiItem, "stock" | "active"> & {
  stock?: number
  active?: boolean
}

export async function createProduct(input: ProductInput): Promise<ProductApiItem> {
  return prisma.product.create({ data: { ...input, stock: input.stock ?? 0, active: input.active ?? true } })
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  try {
    return await prisma.product.update({ where: { id }, data: input })
  } catch {
    return undefined
  }
}

export async function deleteProduct(id: string) {
  const result = await prisma.product.updateMany({ where: { id, active: true }, data: { active: false } })
  return result.count > 0
}
