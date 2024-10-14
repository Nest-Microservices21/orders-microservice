ALTER TYPE "status" ADD VALUE 'PAID';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order-receipts" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"receipt_url" text NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone,
	CONSTRAINT "order-receipts_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "stripe_charge_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order-receipts" ADD CONSTRAINT "order-receipts_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
