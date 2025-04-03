/**
 * Script to update import map with required Fresh framework mappings
 */

const importMapPath = "./import_map.json";

// Read the current import map
const importMapText = await Deno.readTextFile(importMapPath);
const importMap = JSON.parse(importMapText);

// Add the $fresh mapping
if (!importMap.imports["$fresh/"]) {
  importMap.imports["$fresh/"] = "https://deno.land/x/fresh@1.5.4/";
}

// Write the updated import map back
await Deno.writeTextFile(
  importMapPath,
  JSON.stringify(importMap, null, 2) + "\n"
);

console.log("Import map updated successfully.");
