CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED');

ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order"
  ALTER COLUMN "status" TYPE "OrderStatus_new"
  USING (
    CASE "status"::text
      WHEN 'PAID' THEN 'CONFIRMED'
      WHEN 'PENDING' THEN 'PENDING_PAYMENT'
      ELSE "status"::text
    END
  )::"OrderStatus_new";

DROP TYPE "OrderStatus";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING_PAYMENT';