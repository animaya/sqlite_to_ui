/**
 * SQLite Visualizer - Main Server Entry Point
 * 
 * This file initializes the Fresh framework server and sets up
 * the SQLite Visualizer backend services.
 */

import { start } from "fresh/server.ts";
import manifest from "./fresh.gen.ts";
import * as indexRoute from "./routes/index.ts";
import * as staticRoute from "./routes/static.ts";
import { initAppDatabase } from "./services/configurationManager.ts";
import { errorHandler } from "./middleware/errorHandler.ts";

// Add global middleware
const globalMiddleware = [errorHandler];

// Initialize application database
try {
  console.log("Initializing application database...");
  await initAppDatabase();
  console.log("Application database initialized successfully.");
} catch (error) {
  console.error("Failed to initialize application database:", error);
  console.error("The application may not function correctly. Please check database permissions.");
}

// Configure server options
const serverOptions = {
  port: 8000,
  hostname: "0.0.0.0", // Allow connections from any IP
};

// Add manual routes to auto-generated manifest
manifest.routes["/"] = indexRoute;
manifest.routes["/static/:path*"] = staticRoute;

// Start the Fresh server
console.log(`Starting SQLite Visualizer server on http://localhost:${serverOptions.port}...`);
await start(manifest, { ...serverOptions, middleware: { global: globalMiddleware } });
console.log(`SQLite Visualizer server running on http://localhost:${serverOptions.port}`);

// Handle graceful shutdown
const shutdown = () => {
  console.log("Shutting down SQLite Visualizer server...");
  Deno.exit(0);
};

// Register signal handlers for graceful shutdown
Deno.addSignalListener("SIGINT", shutdown);
Deno.addSignalListener("SIGTERM", shutdown);
