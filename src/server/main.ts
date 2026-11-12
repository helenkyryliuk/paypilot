// Local development entry point: `npm run dev`.
// vite-express serves the React app (with hot reload) and the API on one port.
import ViteExpress from "vite-express";
import app from "./app.js";

const PORT = Number(process.env.PORT) || 5000;

ViteExpress.listen(app, PORT, () => {
  console.log(`PayPilot running at http://localhost:${PORT}`);
});
