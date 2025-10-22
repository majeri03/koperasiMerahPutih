-- CreateEnum
CREATE TYPE "public"."InventoryCondition" AS ENUM ('BAIK', 'PERLU_PERBAIKAN', 'RUSAK');

-- CreateTable
CREATE TABLE "public"."inventory_items" (
    "id" TEXT NOT NULL,
    "item_code" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "purchase_date" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "total_value" DOUBLE PRECISION NOT NULL,
    "technical_life_span" INTEGER,
    "economic_life_span" INTEGER,
    "condition" "public"."InventoryCondition" NOT NULL DEFAULT 'BAIK',
    "location" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_item_code_key" ON "public"."inventory_items"("item_code");
