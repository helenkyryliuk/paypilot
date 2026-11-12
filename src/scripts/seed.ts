// Seeds the data PayPilot needs to run: `npm run db:seed`.
// Safe to run repeatedly: upsert creates the row once, then only updates it.
// Point DATABASE_URL at the database you want to seed (dev or production).
import { prisma } from "../server/lib/prisma.js";

// The single MVP seller. paymentLinks.controller.ts connects every new
// payment link to this email, so it must exist before links can be created.
const DEMO_SELLER = {
  email: "helen@paypilot.dev",
  name: "Helen",
};

async function main() {
  const seller = await prisma.user.upsert({
    where: { email: DEMO_SELLER.email },
    update: { name: DEMO_SELLER.name },
    create: DEMO_SELLER,
  });

  console.log(`Seller ready: ${seller.name} <${seller.email}> (${seller.id})`);
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
