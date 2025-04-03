/**
 * Error Handler Middleware
 * 
 * Catches errors in request handling and returns appropriate responses.
 */

import { MiddlewareHandler } from "fresh/server.ts";

/**
 * Application error class
 */
export class AppError extends Error {
  status: number;
  
  constructor(message: string, status = 500) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}

/**
 * Error handler middleware
 */
export const errorHandler: MiddlewareHandler = async (req, ctx) => {
  try {
    return await ctx.next();
  } catch (err) {
    console.error("Request error:", err);
    
    const status = err instanceof AppError ? err.status : 500;
    const message = err instanceof Error ? err.message : "An unknown error occurred";
    
    return new Response(JSON.stringify({
      error: message,
    }), {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
