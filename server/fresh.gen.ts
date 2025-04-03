// This file is auto-generated by Fresh.
// Do not modify this file manually.

import * as $0 from "./routes/connections.ts";
import * as $1 from "./routes/export.ts";
import * as $2 from "./routes/tables.ts";
import * as $3 from "./routes/templates.ts";
import * as $4 from "./routes/visualizations.ts";
import * as errorHandler from "./middleware/errorHandler.ts";
import * as notFoundHandler from "./middleware/errorHandler.ts";

const manifest = {
  routes: {
    "/api/connections": $0,
    "/api/export": $1,
    "/api/tables": $2,
    "/api/templates": $3,
    "/api/visualizations": $4,
  },
  islands: {},
  baseUrl: import.meta.url,
  middlewares: {
    error: errorHandler,
    notFound: notFoundHandler,
  }
};

export default manifest;
