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
