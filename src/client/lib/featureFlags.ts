// Feature flags, read in one place so every page agrees.
// Vite builds VITE_* variables into the frontend at build time, so changing
// one in Vercel needs a redeploy.

// The dashboard and payment pages. Off in production until
// VITE_APP_ENABLED=true; always on in local development (`npm run dev`).
export const isAppEnabled =
  import.meta.env.DEV || import.meta.env.VITE_APP_ENABLED === "true";

// Public demo: editing and deleting links is hidden in the dashboard (and
// blocked by the API, see blockInDemoMode in paymentLinks.routes.ts).
export const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";
