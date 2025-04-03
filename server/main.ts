/**
 * SQLite Visualizer - Main Server Entry Point
 * 
 * This file initializes the Fresh framework server and sets up
 * the SQLite Visualizer backend services.
 */

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import { additionalRoutes } from "./routes_config.ts";
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
  port: parseInt(Deno.env.get("PORT") || "8000"),
  hostname: "0.0.0.0", // Allow connections from any IP
};

// Function to check if port is in use
async function isPortAvailable(port: number): Promise<boolean> {
  try {
    const listener = Deno.listen({ port });
    listener.close();
    return true;
  } catch (err) {
    if (err instanceof Deno.errors.AddrInUse) {
      console.warn(`Port ${port} is already in use. Trying another port...`);
      return false;
    }
    throw err;
  }
}

// Find available port
let retries = 5;
while (retries > 0 && !await isPortAvailable(serverOptions.port)) {
  serverOptions.port++;
  retries--;
}

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
