/**
 * Build Script
 * 
 * Compiles TypeScript code and bundles it for production.
 */

import { bundle } from "https://deno.land/x/emit@0.24.0/mod.ts";

async function build() {
  console.log("Building production assets...");
  
  try {
    // Bundle the main app code
    const result = await bundle("./src/App.tsx");
    const { code } = result;
    
    // Write the bundled code to the static directory
    await Deno.writeTextFile("./static/main.js", code);
    
    // Apply Tailwind (we're using CDN in this example, but you could process it here)
    
    console.log("Build complete!");
  } catch (error) {
    console.error("Build failed:", error);
    Deno.exit(1);
  }
}

// Run the build
build();
