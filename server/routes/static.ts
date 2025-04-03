/**
 * Static File Handler
 * 
 * Serves static assets like JavaScript, CSS, and images.
 */

import { Handlers } from "fresh/server.ts";

export const handler: Handlers = {
  /**
   * GET /static/:path* - Serve static files
   */
  async GET(req, ctx) {
    const { path } = ctx.params;
    
    try {
      // Construct the file path with absolute path
      const filePath = `${Deno.cwd()}/static/${path}`;
      console.log(`Attempting to read file: ${filePath}`);
      
      // Check if file exists
      try {
        const fileInfo = await Deno.stat(filePath);
        console.log(`File exists: ${fileInfo.isFile}`);
      } catch (e) {
        console.error(`File does not exist: ${filePath}`, e);
        return new Response(`File not found: ${filePath}`, { status: 404 });
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
      return new Response("File not found", { status: 404 });
    }
  }
};
