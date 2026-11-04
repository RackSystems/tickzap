CREATE INDEX "requester_tenant_id_idx" ON "requester" ("tenant_id");--> statement-breakpoint
CREATE INDEX "session_tenant_id_idx" ON "sessions" ("tenant_id");--> statement-breakpoint
CREATE INDEX "tenant_document_number_name_idx" ON "tenants" ("document_number","name");--> statement-breakpoint
CREATE INDEX "tenant_is_active_idx" ON "tenants" ("is_active");--> statement-breakpoint
CREATE INDEX "ticket_tenant_id_idx" ON "ticket" ("tenant_id");--> statement-breakpoint
CREATE INDEX "user_tenant_id_idx" ON "users" ("tenant_id");