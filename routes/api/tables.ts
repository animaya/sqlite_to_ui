import { Handlers } from "$fresh/server.ts";
import { DB } from "sqlite";

interface TableResponse {
  tables: string[];
  error?: string;
}

// Simple in-memory DB connection for demo
const DB_PATH = Deno.env.get("DB_PATH") || "./sqlite_visualizer_app.db";

export const handler: Handlers = {
  async GET(req, ctx) {
    try {
      // Open database connection
      const db = new DB(DB_PATH);

      // Query for all tables
      const tables = db.query<[string]>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
      ).map(row => row[0]);

      // Close the database
      db.close();

      // Return the result
      return new Response(JSON.stringify({ tables }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error querying tables:", error);
      return new Response(
        JSON.stringify({ 
          tables: [],
          error: error instanceof Error ? error.message : "Unknown error"
        }),
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  }
};