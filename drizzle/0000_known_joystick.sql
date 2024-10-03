DO $$ BEGIN
 CREATE TYPE "public"."status" AS ENUM('PENDING', 'DELIVERED', 'CANCELLED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"status" "status",
	"paid" boolean DEFAULT false NOT NULL,
	"paid_at" timestamp (3) with time zone,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone
);
