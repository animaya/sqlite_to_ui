/**
 * Routes Configuration
 * 
 * Manual configuration of routes for Fresh to use in addition to the auto-generated routes.
 */

import * as indexRoute from "./routes/index.ts";
import * as staticRoute from "./routes/static.ts";

export const additionalRoutes = {
  "/": indexRoute,
  "/static/:path*": staticRoute
};
