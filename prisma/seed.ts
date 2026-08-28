import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { products } from "../src/lib/products.mock"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice,
        category: product.category,
        brand: product.brand,
        size: product.size,
        image: product.image,
        description: product.description,
        accent: product.accent,
        featured: product.featured ?? false,
      },
      create: {
        id: product.id,
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice,
        category: product.category,
        brand: product.brand,
        size: product.size,
        image: product.image,
        description: product.description,
        accent: product.accent,
        featured: product.featured ?? false,
        stock: 10,
      },
    })
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())