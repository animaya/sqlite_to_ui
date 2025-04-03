/**
 * Build Script
 * 
 * Compiles TypeScript code and processes CSS for production.
 */

import { bundle } from "https://deno.land/x/emit@0.24.0/mod.ts";
import postcss from "https://deno.land/x/postcss@8.4.16/mod.js";
import tailwindcss from "https://esm.sh/tailwindcss@3.3.3";
import autoprefixer from "https://esm.sh/autoprefixer@10.4.14";
import cssnano from "https://esm.sh/cssnano@6.0.1";

async function build() {
  console.log("Building production assets...");
  
  try {
    // Bundle the main app code
    console.log("Bundling JavaScript...");
    const result = await bundle("./src/App.tsx");
    const { code } = result;
    
    // Write the bundled code to the static directory
    await Deno.writeTextFile("./static/main.js", code);
    console.log("JavaScript bundling complete!");
    
    // Process CSS with Tailwind
    console.log("Processing CSS with Tailwind...");
    const cssInput = `
      @tailwind base;
      @tailwind components;
      @tailwind utilities;
      
      /* Custom application styling */
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      /* Additional custom styling can be added here */
    `;
    
    const cssResult = await postcss([
      tailwindcss("./tailwind.config.js"),
      autoprefixer(),
      cssnano({ preset: 'default' })
    ]).process(cssInput, { from: undefined });
    
    await Deno.writeTextFile("./static/styles.css", cssResult.css);
    console.log("CSS processing complete!");
    
    console.log("Build complete!");
  } catch (error) {
    console.error("Build failed:", error);
    Deno.exit(1);
  }
}

// Run the build
build();
