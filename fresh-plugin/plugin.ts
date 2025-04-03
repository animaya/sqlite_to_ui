import { Plugin } from "$fresh/server.ts";
import { resolve } from "https://deno.land/std@0.167.0/path/mod.ts";

export default {
  name: "staticFilesPlugin",
  routes: [
    {
      path: "/static/:path*",
      handler: async (req, ctx) => {
        const path = ctx.params.path;
        
        try {
          // Construct the file path with absolute path
          const filePath = `${Deno.cwd()}/static/${path}`;
          
          // Check if file exists
          try {
            const fileInfo = await Deno.stat(filePath);
            if (!fileInfo.isFile) {
              return new Response(`Not a file: ${path}`, { status: 404 });
            }
          } catch (e) {
            return new Response(`File not found: ${path}`, { status: 404 });
          }
          
          // Get the file
          const file = await Deno.readFile(filePath);
          
          // Determine content type based on file extension
          let contentType = "application/octet-stream";
          if (path.endsWith(".js")) {
            contentType = "application/javascript";
          } else if (path.endsWith(".css")) {
            contentType = "text/css";
          } else if (path.endsWith(".svg")) {
            contentType = "image/svg+xml";
          } else if (path.endsWith(".png")) {
            contentType = "image/png";
          } else if (path.endsWith(".jpg") || path.endsWith(".jpeg")) {
            contentType = "image/jpeg";
          }
          
          return new Response(file, {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=3600" // Cache for 1 hour
            }
          });
        } catch (error) {
          console.error(`Error serving static file ${path}:`, error);
          return new Response(`Error serving file: ${error.message}`, { status: 500 });
        }
      }
    }
  ]
} as Plugin;