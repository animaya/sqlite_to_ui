#!/usr/bin/env -S deno run -A --watch=static/,routes/

import dev from "$fresh/dev.ts";
import config from "./fresh.config.ts";

import "$std/dotenv/load.ts";

// First check if port is available
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

await dev(import.meta.url, "./main.ts", config);
