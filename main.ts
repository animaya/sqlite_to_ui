/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import "$std/dotenv/load.ts";

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import config from "./fresh.config.ts";
import { initAppDatabase } from "./server/services/configurationManager.ts";

// Function to check if a port is available
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

// Find an available port
const basePort = config.server?.port || 8000;
let port = basePort;
const maxRetries = 10;

for (let i = 0; i < maxRetries; i++) {
  if (await isPortAvailable(port)) {
    break;
  }
  port++;
  if (i === maxRetries - 1) {
    console.error(`Could not find an available port after ${maxRetries} attempts.`);
    Deno.exit(1);
  }
}

// Update the port in the config
config.server = { ...config.server, port };
console.log(`Using port: ${port}`);

// Initialize application database
try {
  console.log("Initializing application database...");
  await initAppDatabase();
  console.log("Application database initialized successfully.");
} catch (error) {
  console.error("Failed to initialize application database:", error);
  console.error("The application may not function correctly. Please check database permissions.");
}

await start(manifest, config);
