// Vercel entry point. Every file in /api becomes a serverless function.
// An Express app is a (req, res) handler, so Vercel can run it directly.
// vercel.json rewrites all /api/* requests here; Express then routes them.
import app from "../src/server/app.js";

export default app;
