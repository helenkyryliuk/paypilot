// Public landing page at "/".
import type { ReactNode } from "react";
import {
  ArrowRight,
  ChartNoAxesCombined,
  CircleCheck,
  Clock,
  CreditCard,
  LayoutDashboard,
  Link2,
  Lock,
  Share2,
  ShieldCheck,
} from "lucide-react";
import "./LandingPage.css";
import logoUrl from "./assets/logo.svg";

const GITHUB_REPO_URL = "https://github.com/helenkyryliuk/paypilot";

const steps = [
  {
    icon: Link2,
    title: "Create a link",
    text: "Add a product name, price and description. PayPilot generates a unique URL for it.",
  },
  {
    icon: Share2,
    title: "Share it anywhere",
    text: "Drop the link in your bio, a DM, an email or a newsletter. No online store needed.",
  },
  {
    icon: CreditCard,
    title: "Get paid",
    text: "Buyers pay on a secure Stripe checkout, and the payment shows up in your dashboard.",
  },
];

const features = [
  {
    icon: Link2,
    title: "Payment links",
    text: "Create, share, pause and delete links for digital products and coaching sessions.",
  },
  {
    icon: ShieldCheck,
    title: "Secure checkout",
    text: "Stripe Payment Element handles card details, so they never touch PayPilot's servers.",
  },
  {
    icon: LayoutDashboard,
    title: "Creator dashboard",
    text: "See every link with its status, number of payments and revenue in one table.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Analytics",
    text: "Revenue and sales charts to see what's selling.",
    inProgress: true,
  },
];

const techStack = [
  "React",
  "TypeScript",
  "Vite",
  "Tailwind CSS",
  "Express",
  "Prisma",
  "PostgreSQL (Neon)",
  "Stripe",
  "Vercel",
];

export function LandingPage() {
  return (
    <div className="landing min-h-svh">
      <SiteHeader />

      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <TechStack />
        <ClosingCta />
      </main>

      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="border-b border-(--line) bg-white/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Brand />
        <nav aria-label="Main" className="flex items-center gap-6 text-sm">
          <a
            href="#how-it-works"
            className="hidden text-(--ink-muted) hover:text-(--ink) sm:inline"
          >
            How it works
          </a>
          <a
            href="#features"
            className="hidden text-(--ink-muted) hover:text-(--ink) sm:inline"
          >
            Features
          </a>
          <GitHubLink variant="outline" size="sm" />
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="lp-hero-glow">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-24 lg:pb-28">
        <div>
          <p className="lp-eyebrow">Payments made simpler</p>

          <h1 className="lp-title mt-4">
            Turn what you create into income with{" "}
            <span className="text-gradient">one simple link</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed">
            Turn your products, services and content into one simple payment
            link. Share it anywhere and get paid through Stripe.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <GitHubLink variant="primary" label="View the code on GitHub" />
            <DemoComingSoon />
          </div>

          <p className="mt-6 inline-flex items-center gap-2 text-sm">
            <span className="size-1.5 rounded-full bg-(--brand-green)" />
            Portfolio project · runs in Stripe test mode
          </p>
        </div>

        <CheckoutPreview />
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 border-t border-(--line)">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading eyebrow="How it works">
          From idea to <span className="text-gradient">paid</span> in three
          steps
        </SectionHeading>

        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="rounded-2xl border border-(--line) bg-white p-6"
            >
              <div className="flex items-center justify-between">
                <span className="lp-icon-tile" aria-hidden="true">
                  <step.icon className="size-5" />
                </span>
                <span className="text-sm font-semibold text-(--ink-muted)">
                  Step {index + 1}
                </span>
              </div>
              <h3 className="lp-card-title mt-5">{step.title}</h3>
              <p className="mt-2 leading-relaxed">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section
      id="features"
      className="scroll-mt-16 border-t border-(--line) bg-(--surface)"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading eyebrow="Features">
          Everything a solo creator needs{" "}
          <span className="text-gradient">to get paid</span>
        </SectionHeading>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2">
          {features.map((feature) => (
            <li
              key={feature.title}
              className="flex gap-4 rounded-2xl border border-(--line) bg-white p-6"
            >
              <span className="lp-icon-tile shrink-0" aria-hidden="true">
                <feature.icon className="size-5" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="lp-card-title">{feature.title}</h3>
                  {feature.inProgress && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                      In progress
                    </span>
                  )}
                </div>
                <p className="mt-2 leading-relaxed">{feature.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function TechStack() {
  return (
    <section className="border-t border-(--line)">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading eyebrow="Under the hood">
          A full-stack TypeScript app
        </SectionHeading>
        <p className="mx-auto mt-4 max-w-2xl text-center leading-relaxed">
          A React frontend talks to an Express REST API. Prisma stores links and
          payments in PostgreSQL, and Stripe webhooks keep each payment's status
          in sync.
        </p>

        <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2.5">
          {techStack.map((tech) => (
            <li
              key={tech}
              className="rounded-full border border-(--line) bg-white px-4 py-1.5 text-sm font-medium text-(--ink)"
            >
              {tech}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="px-4 pb-20 sm:px-6">
      <div className="bg-brand-gradient mx-auto flex max-w-6xl flex-col items-center gap-6 rounded-3xl px-6 py-14 text-center">
        <h2 className="lp-section-title text-white!">
          Curious how it's built?
        </h2>
        <p className="max-w-xl text-white/90">
          Browse the source code, from the Stripe webhook to the React
          components. The live demo is coming soon.
        </p>
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-(--ink) shadow-sm transition hover:shadow-md"
        >
          <GitHubMark className="size-4" />
          View on GitHub
          <ArrowRight className="size-4" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-(--line)">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm sm:flex-row sm:px-6">
        <Brand />
        <p>Designed and built by Helen Kyryliuk</p>
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 hover:text-(--ink)"
        >
          <GitHubMark className="size-4" />
          GitHub
        </a>
      </div>
    </footer>
  );
}

/* ---------- Small building blocks ---------- */

function Brand() {
  return (
    <a href="/" className="flex items-center gap-2.5">
      <img src={logoUrl} alt="" className="size-8" />
      <span className="text-lg font-semibold tracking-tight text-(--ink)">
        PayPilot
      </span>
    </a>
  );
}

function SectionHeading({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="lp-eyebrow">{eyebrow}</p>
      <h2 className="lp-section-title mt-3">{children}</h2>
    </div>
  );
}

function GitHubLink({
  variant,
  size = "md",
  label = "GitHub",
}: {
  variant: "primary" | "outline";
  size?: "sm" | "md";
  label?: string;
}) {
  const sizeClasses = size === "sm" ? "px-3.5 py-1.5" : "px-6 py-3";
  const variantClasses =
    variant === "primary"
      ? "bg-(--button) text-white hover:bg-(--button-hover)"
      : "border border-(--line) bg-white text-(--ink) hover:bg-(--surface)";

  return (
    <a
      href={GITHUB_REPO_URL}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition ${sizeClasses} ${variantClasses}`}
    >
      <GitHubMark className="size-4" />
      {label}
    </a>
  );
}

function DemoComingSoon() {
  return (
    <button
      type="button"
      disabled
      className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-full border border-dashed border-(--line) bg-white px-6 py-3 text-sm font-semibold text-(--ink-muted)"
    >
      Live demo
      <span className="inline-flex items-center gap-1 rounded-full bg-(--surface) px-2 py-0.5 text-xs font-medium">
        <Clock className="size-3" aria-hidden="true" />
        Coming soon
      </span>
    </button>
  );
}

// GitHub's logo. lucide-react no longer ships brand icons, so it's inlined.
function GitHubMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

// Floating "total revenue" card from the creator's dashboard. Illustrative
// numbers, labelled as such on the card.
function RevenueCard() {
  return (
    <div className="mt-4 rounded-2xl border border-(--line) bg-white p-5 shadow-lg sm:absolute sm:-bottom-12 sm:-left-16 sm:mt-0 sm:w-72">
      <p className="text-xs font-medium tracking-wide uppercase">
        Total revenue
      </p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-(--ink)">
        NZ$24,850.00
      </p>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span>Recent transactions</span>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
          +12.8%
        </span>
      </div>
      <div className="mt-3 space-y-2" aria-hidden="true">
        <div className="h-2 w-full rounded-full bg-(--brand-teal)/12" />
        <div className="h-2 w-3/4 rounded-full bg-(--brand-teal)/12" />
        <div className="h-2 w-1/2 rounded-full bg-(--brand-teal)/12" />
      </div>
      <p className="mt-3 text-xs text-slate-400">Illustrative dashboard preview</p>
    </div>
  );
}

// An illustration of PayPilot's checkout page, built from HTML (not a
// screenshot) so it stays sharp at any size. Not interactive.
function CheckoutPreview() {
  return (
    <div
      role="img"
      aria-label="Preview of a PayPilot checkout page for a NZ$120 coaching session, with a dashboard card showing NZ$24,850 total revenue"
      className="relative mx-auto w-full max-w-sm"
    >
      <div className="rounded-3xl border border-(--line) bg-white p-6 shadow-[0_24px_60px_-20px_rgb(11_18_32/0.25)]">
        <div className="flex items-center gap-3">
          <span className="bg-brand-gradient grid size-10 place-items-center rounded-full text-sm font-semibold text-white">
            HK
          </span>
          <div className="text-sm">
            <p className="font-semibold text-(--ink)">Helen's Studio</p>
            <p className="text-xs">paypilot.app/pay/design-coaching</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-(--surface) p-4">
          <p className="font-semibold text-(--ink)">1:1 Design Coaching</p>
          <p className="mt-1 text-sm">60-minute video session</p>
          <p className="mt-4 text-3xl font-bold tracking-tight text-(--ink)">
            NZ$120.00
          </p>
        </div>

        <div className="mt-5 space-y-3">
          <FakeField label="Card number" value="4242 4242 4242 4242" />
          <div className="grid grid-cols-2 gap-3">
            <FakeField label="Expiry" value="12 / 29" />
            <FakeField label="CVC" value="123" />
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-(--button) py-3 text-center text-sm font-semibold text-white">
          Pay NZ$120.00
        </div>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs">
          <Lock className="size-3" aria-hidden="true" />
          Secured by Stripe
        </p>
      </div>

      <RevenueCard />

      <div className="absolute -top-5 -right-3 flex items-center gap-2.5 rounded-2xl border border-(--line) bg-white px-4 py-3 shadow-lg sm:-right-10">
        <CircleCheck className="size-5 text-(--brand-green)" aria-hidden="true" />
        <div className="text-xs">
          <p className="font-semibold text-(--ink)">Payment received</p>
          <p>+NZ$120.00</p>
        </div>
      </div>
    </div>
  );
}

function FakeField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-(--ink)">{label}</p>
      <div className="rounded-lg border border-(--line) px-3 py-2 text-sm text-(--ink-muted)">
        {value}
      </div>
    </div>
  );
}
