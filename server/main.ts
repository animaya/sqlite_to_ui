/**
 * SQLite Visualizer - Main Server Entry Point
 * 
 * This file initializes the Fresh framework server and sets up
 * the SQLite Visualizer backend services.
 */

import { start } from "fresh/server.ts";
import manifest from "./fresh.gen.ts";

// TODO: Import application database service
// import { initAppDatabase } from "./services/appDatabaseService.ts";

// Initialize application database
// TODO: Implement database initialization
// await initAppDatabase();

// Start the Fresh server
console.log("Starting SQLite Visualizer server...");
await start(manifest, { port: 8000 });
console.log("SQLite Visualizer server running on http://localhost:8000");
