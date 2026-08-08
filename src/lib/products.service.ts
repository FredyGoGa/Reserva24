import { products, type Product } from "@/lib/products.mock"

export type ProductApiItem = {
  id: string
  name: string
  price: number
  category: string
  brand: string
  size: string
  description?: string
  accent: string
  featured: boolean
}

function toApiProduct(product: Product): ProductApiItem {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    category: product.category,
    brand: product.brand,
    size: product.size,
    description: product.description,
    accent: product.accent,
    featured: product.featured ?? false,
  }
}

export function getProducts(): ProductApiItem[] {
  return products.map(toApiProduct)
}

export function getProductById(id: string): ProductApiItem | undefined {
  return getProducts().find((product) => product.id === id)
}
