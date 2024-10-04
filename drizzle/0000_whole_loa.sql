DO $$ BEGIN
 CREATE TYPE "public"."status" AS ENUM('PENDING', 'DELIVERED', 'CANCELLED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"price" numeric NOT NULL,
	"order_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"total_items" integer NOT NULL,
	"status" "status" DEFAULT 'PENDING' NOT NULL,
	"paid" boolean DEFAULT false NOT NULL,
	"paid_at" timestamp (3) with time zone,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
