import { prisma } from "../server/lib/prisma.ts";

async function main() {
  // Create Helen or return the existing Helen record.
  const user = await prisma.user.upsert({
    where: {
      email: "helen@paypilot.dev",
    },
    update: {
      name: "Helen",
    },
    create: {
      name: "Helen",
      email: "helen@paypilot.dev",
    },
  });

  console.log("User created or found:");
  console.log(user);

  // Create a test payment link.
  const paymentLink = await prisma.paymentLink.create({
    data: {
      productName: "Test Digital Guide",
      description: "A temporary payment link used to test Prisma",
      amount: 2900,
      currency: "usd",
      slug: `test-digital-guide-${Date.now()}`,
      downloadUrl: "https://example.com/test-download",
      userId: user.id,
    },
  });

  console.log("Payment link created:");
  console.log(paymentLink);

  // Read the link back with its related user and payments.
  const result = await prisma.paymentLink.findUnique({
    where: {
      id: paymentLink.id,
    },
    include: {
      user: true,
      payments: true,
    },
  });

  console.log("Complete database result:");
  console.dir(result, { depth: null });
}

main()
  .catch((error: unknown) => {
    console.error("Database test failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
