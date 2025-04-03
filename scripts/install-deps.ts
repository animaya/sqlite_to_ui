/**
 * Dependency Installation Script
 * 
 * This script installs or updates all dependencies required for the project.
 */

async function installDependencies() {
  console.log("Installing project dependencies...");
  
  try {
    // Make sure Deno has the latest version
    console.log("Updating Deno cache...");
    const updateCmd = new Deno.Command(Deno.execPath(), {
      args: ["cache", "--reload", "import_map.json"],
      stdout: "inherit",
      stderr: "inherit",
    });
    
    const updateResult = await updateCmd.output();
    if (!updateResult.success) {
      throw new Error("Failed to update Deno cache");
    }
    
    // Install specific import map dependencies
    console.log("Installing dependencies from import map...");
    const importMap = JSON.parse(await Deno.readTextFile("./import_map.json"));
    const imports = importMap.imports || {};
    
    for (const [name, url] of Object.entries(imports)) {
      if (typeof url === "string" && !url.startsWith("./")) {
        console.log(`Caching: ${name} from ${url}`);
        const cacheCmd = new Deno.Command(Deno.execPath(), {
          args: ["cache", url],
          stdout: "null",
          stderr: "piped",
        });
        
        const cacheResult = await cacheCmd.output();
        if (!cacheResult.success) {
          const errorText = new TextDecoder().decode(cacheResult.stderr);
          console.error(`Error caching ${name}: ${errorText}`);
        }
      }
    }
    
    console.log("Dependencies installed successfully!");
  } catch (error) {
    console.error("Error installing dependencies:", error);
    Deno.exit(1);
  }
}

// Run the installation
await installDependencies();
