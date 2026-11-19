// Public landing page at "/". Placeholder until the design is ready.
import { Link } from "react-router";
import { buttonVariants } from "@/components/ui/button";

export function LandingPage() {
  return (
    <main className="min-h-svh flex flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-4xl font-bold">PayPilot</h1>
      <p className="text-muted-foreground max-w-md">
        Payment links for creators selling digital products and coaching.
      </p>
      <Link to="/dashboard" className={buttonVariants()}>
        Open dashboard
      </Link>
    </main>
  );
}
