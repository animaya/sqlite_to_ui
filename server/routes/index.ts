/**
 * Main Route Handler
 * 
 * Serves the Single Page Application (SPA) for the SQLite Visualizer.
 * This routes all non-API paths to the frontend application, enabling client-side routing.
 */

import { Handlers } from "fresh/server.ts";

export const handler: Handlers = {
  /**
   * GET / - Serve the SPA HTML
   */
  async GET(req, ctx) {
    // Get the URL path
    const url = new URL(req.url);
    const path = url.pathname;
    
    // If this is an API request, let other routes handle it
    if (path.startsWith("/api/")) {
      return ctx.next();
    }
    
    // For all other paths, serve the SPA
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SQLite Visualizer</title>
  <meta name="description" content="A clean, user-friendly web application that visualizes SQLite database content">
  <link rel="stylesheet" href="/static/styles.css">
  <!-- Preload the Inter font -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body class="bg-slate-50 font-sans">
  <div id="app"></div>
  <script type="module" src="/static/main.js"></script>
</body>
</html>
    `.trim();
    
    return new Response(htmlContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  },
};
