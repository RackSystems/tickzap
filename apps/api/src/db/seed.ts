import { and, eq } from "drizzle-orm";
import { seed } from "drizzle-seed";
import { db } from "./drizzle";
import { tenant, user } from "./schema";

async function main(): Promise<void> {
  const name = process.env.SEED_USER_NAME?.trim();
  const email = process.env.SEED_USER_EMAIL?.trim().toLowerCase();
  const plainPassword = process.env.SEED_USER_PASSWORD;

  const tenantName = process.env.SEED_TENANT_NAME?.trim();
  const tenantDocumentType = process.env.SEED_TENANT_DOCUMENT_TYPE?.trim().toUpperCase();
  const tenantDocumentNumber = process.env.SEED_TENANT_DOCUMENT_NUMBER?.replace(/\D/g, "");

  if (
    !name ||
    !email ||
    !plainPassword ||
    !tenantName ||
    !tenantDocumentType ||
    !tenantDocumentNumber
  ) {
    throw new Error(
      "SEED_USER_NAME, SEED_USER_EMAIL, SEED_USER_PASSWORD, " +
        "SEED_TENANT_NAME, SEED_TENANT_DOCUMENT_TYPE and " +
        "SEED_TENANT_DOCUMENT_NUMBER are required",
    );
  }

  if (plainPassword.length < 6 || plainPassword.length > 32) {
    throw new Error(
      "SEED_USER_PASSWORD must contain between 6 and 32 characters",
    );
  }

  let [seedTenant] = await db
    .select({ id: tenant.id })
    .from(tenant)
    .where(
      and(
        eq(tenant.name, tenantName),
        eq(tenant.documentNumber, tenantDocumentNumber),
      ),
    )
    .limit(1);

  if (!seedTenant) {
    [seedTenant] = await db
      .insert(tenant)
      .values({
        name: tenantName,
        documentType: tenantDocumentType,
        documentNumber: tenantDocumentNumber,
      })
      .returning({ id: tenant.id });
  }

  if (!seedTenant) {
    throw new Error("Failed to create seed tenant");
  }

  const tenantId = seedTenant.id;

  const [existingUser] = await db
    .select({ id: user.id, tenantId: user.tenantId })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (existingUser) {
    if (!existingUser.tenantId) {
      await db
        .update(user)
        .set({ tenantId })
        .where(eq(user.id, existingUser.id));
    }
    console.log(`Seed user already exists: ${email}, in tenant ${tenantName}`);
    return;
  }

  const password = await Bun.password.hash(plainPassword, {
    algorithm: "bcrypt",
    cost: 12,
  });

  await seed(db, { users: user }, { count: 1, seed: 1 }).refine((f) => ({
    users: {
      count: 1,
      columns: {
        name: f.default({ defaultValue: name }),
        email: f.default({ defaultValue: email }),
        password: f.default({ defaultValue: password }),
        avatar: f.default({ defaultValue: null }),
        isActive: f.default({ defaultValue: true }),
        tenantId: f.default({ defaultValue: tenantId }),
      },
    },
  }));

  console.log(`Seed user created: ${email}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
