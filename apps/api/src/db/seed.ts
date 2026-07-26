import { eq } from "drizzle-orm";
import { seed } from "drizzle-seed";
import { db } from "./drizzle";
import { user } from "./schema";

async function main(): Promise<void> {
  const name = process.env.SEED_USER_NAME?.trim();
  const email = process.env.SEED_USER_EMAIL?.trim().toLowerCase();
  const plainPassword = process.env.SEED_USER_PASSWORD;

  if (!name || !email || !plainPassword) {
    throw new Error(
      "SEED_USER_NAME, SEED_USER_EMAIL and SEED_USER_PASSWORD are required",
    );
  }

  if (plainPassword.length < 6 || plainPassword.length > 32) {
    throw new Error(
      "SEED_USER_PASSWORD must contain between 6 and 32 characters",
    );
  }

  const [existingUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (existingUser) {
    console.log(`Seed user already exists: ${email}`);
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
        tenantId: f.default({ defaultValue: null }),
      },
    },
  }));

  console.log(`Seed user created: ${email}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
