ALTER TABLE "requester" ADD COLUMN "tenant_id" uuid;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "tenant_id" uuid;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "document_type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "document_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "tenant_id" uuid;--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_identifier_key" ON "tenants" ("name","document_number");--> statement-breakpoint
ALTER TABLE "requester" ADD CONSTRAINT "requester_tenant_id_tenants_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id");--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_tenant_id_tenants_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id");--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_tenant_id_tenants_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id");