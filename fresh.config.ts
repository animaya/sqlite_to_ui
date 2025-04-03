import { defineConfig } from "$fresh/server.ts";
import staticPlugin from "./fresh-plugin/plugin.ts";

export default defineConfig({
  plugins: [staticPlugin],
  server: {
    port: parseInt(Deno.env.get("PORT") || "8000"),
  }
});
