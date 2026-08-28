CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

CREATE TABLE "Product" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "price" INTEGER NOT NULL,
  "oldPrice" INTEGER,
  "category" TEXT NOT NULL,
  "brand" TEXT NOT NULL,
  "size" TEXT NOT NULL,
  "image" TEXT,
  "description" TEXT,
  "accent" TEXT NOT NULL,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Order" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "customerName" TEXT NOT NULL,
  "document" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "notes" TEXT,
  "total" INTEGER NOT NULL
);

CREATE TABLE "OrderItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "orderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "qty" INTEGER NOT NULL,
  "unitPrice" INTEGER NOT NULL,
  "subtotal" INTEGER NOT NULL,
  CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE,
  CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id")
);

CREATE INDEX "Product_active_idx" ON "Product"("active");
CREATE INDEX "Product_category_idx" ON "Product"("category");
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");