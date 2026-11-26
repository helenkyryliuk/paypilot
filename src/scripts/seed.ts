// Seeds (and resets) the demo account: `npm run db:seed`.
//
// What it does, in order:
// 1. Creates the demo seller if missing (paymentLinks.controller.ts connects
//    every new payment link to this email, so it must exist).
// 2. Deletes ALL payment links and payments that belong to the demo seller.
// 3. Recreates a fixed set of sample links with realistic payment history.
//
// So it doubles as a "reset demo" script: run it to clean up whatever demo
// visitors created. It only ever touches the demo seller's data.
// Point DATABASE_URL at the database you want to seed (dev or production).
import { prisma } from "../server/lib/prisma.js";
import type { PaymentStatus } from "../generated/prisma/client.js";

const DEMO_SELLER = {
  email: "helen@paypilot.dev",
  name: "Helen",
};

// How many days of payment history to generate, ending today.
const HISTORY_DAYS = 90;

interface SampleLink {
  slug: string;
  productName: string;
  description: string;
  amount: number; // smallest currency unit (cents)
  downloadUrl?: string;
  isActive?: boolean;
  // Roughly how many payment attempts to generate for this link.
  paymentCount: number;
}

const SAMPLE_LINKS: SampleLink[] = [
  {
    slug: "design-coaching",
    productName: "1:1 Design Coaching",
    description: "60-minute video session to review your work and plan next steps.",
    amount: 12000,
    paymentCount: 18,
  },
  {
    slug: "brand-starter-kit",
    productName: "Brand Identity Starter Kit",
    description: "Figma templates for logos, colour palettes and social posts.",
    amount: 4900,
    downloadUrl: "https://example.com/downloads/brand-starter-kit.zip",
    paymentCount: 34,
  },
  {
    slug: "portfolio-review",
    productName: "Portfolio Review",
    description: "Recorded video feedback on your portfolio within 3 days.",
    amount: 7500,
    paymentCount: 15,
  },
  {
    slug: "freelance-pricing-guide",
    productName: "Freelance Pricing Guide",
    description: "Ebook: how to price, package and pitch your services.",
    amount: 2900,
    downloadUrl: "https://example.com/downloads/freelance-pricing-guide.pdf",
    paymentCount: 41,
  },
  {
    slug: "content-calendar-2027",
    productName: "Content Calendar 2027",
    description: "A ready-to-use Notion calendar for a year of social posts.",
    amount: 1900,
    downloadUrl: "https://example.com/downloads/content-calendar-2027",
    paymentCount: 27,
  },
  {
    slug: "monthly-mentorship",
    productName: "Monthly Mentorship",
    description: "Two calls a month plus chat support. Paused for new clients.",
    amount: 25000,
    isActive: false,
    paymentCount: 6,
  },
];

// Fictional buyers. Emails use example.com, a domain reserved for examples,
// so they can never belong to a real person.
const BUYERS = [
  "Aroha Ngata",
  "Liam Chen",
  "Sofia Martins",
  "Noah Williams",
  "Mia Patel",
  "Jack Thompson",
  "Isla Brown",
  "Leo Kim",
  "Ruby Wilson",
  "Hemi Walker",
  "Zara Ahmed",
  "Oliver Smith",
];

// A tiny seeded random number generator (mulberry32). Same seed, same
// numbers, so the demo shows the same totals every time it is reset.
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = createRandom(2026);

function pick<T>(items: T[]): T {
  return items[Math.floor(random() * items.length)];
}

// Most attempts succeed; a few fail, get cancelled or are still pending.
function pickStatus(): PaymentStatus {
  const roll = random();
  if (roll < 0.86) return "SUCCEEDED";
  if (roll < 0.93) return "FAILED";
  if (roll < 0.97) return "CANCELED";
  return "PENDING";
}

// A date within the history window, weighted towards recent days so the
// numbers trend upwards (useful for the analytics charts).
function pickDate(now: Date): Date {
  const daysAgo = Math.floor(Math.pow(random(), 1.6) * HISTORY_DAYS);
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(8 + Math.floor(random() * 13), Math.floor(random() * 60), 0, 0);
  return date;
}

async function main() {
  const now = new Date();

  const seller = await prisma.user.upsert({
    where: { email: DEMO_SELLER.email },
    update: { name: DEMO_SELLER.name },
    create: DEMO_SELLER,
  });

  // Payments reference links with onDelete: Restrict, so delete them first.
  // A transaction makes the reset all-or-nothing.
  const [deletedPayments, deletedLinks] = await prisma.$transaction([
    prisma.payment.deleteMany({
      where: { paymentLink: { userId: seller.id } },
    }),
    prisma.paymentLink.deleteMany({
      where: { userId: seller.id },
    }),
  ]);

  console.log(
    `Reset demo seller ${seller.email}: removed ${deletedLinks.count} links and ${deletedPayments.count} payments.`,
  );

  let paymentTotal = 0;
  let revenueTotal = 0;

  for (const [linkIndex, sample] of SAMPLE_LINKS.entries()) {
    const payments = Array.from({ length: sample.paymentCount }, (_, index) => {
      const buyer = pick(BUYERS);
      const status = pickStatus();
      const createdAt = pickDate(now);

      return {
        // Clearly fake IDs: these payments never went through Stripe.
        stripePaymentIntentId: `pi_demo_${linkIndex}_${index}`,
        amount: sample.amount,
        currency: "nzd",
        status,
        customerName: buyer,
        customerEmail: `${buyer.split(" ")[0].toLowerCase()}@example.com`,
        createdAt,
        updatedAt: createdAt,
      };
    });

    // The link is "created" a few days before its first payment.
    const firstPaymentAt = Math.min(...payments.map((p) => p.createdAt.getTime()));
    const linkCreatedAt = new Date(firstPaymentAt - 3 * 24 * 60 * 60 * 1000);

    await prisma.paymentLink.create({
      data: {
        slug: sample.slug,
        productName: sample.productName,
        description: sample.description,
        amount: sample.amount,
        currency: "nzd",
        downloadUrl: sample.downloadUrl ?? null,
        isActive: sample.isActive ?? true,
        userId: seller.id,
        createdAt: linkCreatedAt,
        payments: { create: payments },
      },
    });

    const succeeded = payments.filter((p) => p.status === "SUCCEEDED");
    paymentTotal += payments.length;
    revenueTotal += succeeded.length * sample.amount;
  }

  console.log(
    `Created ${SAMPLE_LINKS.length} links and ${paymentTotal} payments ` +
      `(NZ$${(revenueTotal / 100).toFixed(2)} in successful payments).`,
  );
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
