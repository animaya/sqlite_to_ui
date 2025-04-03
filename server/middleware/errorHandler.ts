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
    
    // Determine status code
    const status = err instanceof AppError ? err.status : 500;
    
    // Determine error message
    const message = err instanceof Error ? err.message : "An unknown error occurred";
    
    // In development, include stack trace for debugging
    const isDevelopment = Deno.env.get("DENO_ENV") !== "production";
    const details = isDevelopment && err instanceof Error ? err.stack : undefined;
    
    // Return error response
    return new Response(JSON.stringify({
      error: {
        message,
        status,
        details
      }
    }), {
      status,
      headers: {
        "Content-Type": "application/json",
        "X-Error-Code": String(status)
      },
    });
  }
};

/**
 * Not found error handler
 * Used for routes that don't match any handlers
 */
export const notFoundHandler: MiddlewareHandler = async (req, ctx) => {
  // Check if this is an API request
  const isApiRequest = req.url.includes("/api/");
  
  if (isApiRequest) {
    // Return JSON 404 for API requests
    return new Response(JSON.stringify({
      error: {
        message: "Endpoint not found",
        status: 404,
      }
    }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
        "X-Error-Code": "404"
      },
    });
  }
  
  // For non-API requests, continue to the next handler
  // This will typically be the Fresh renderer which handles the 404 page
  return ctx.next();
};

/**
 * Create a validation error
 * @param message Error message
 * @param validationErrors Specific validation errors
 * @returns AppError instance
 */
export function createValidationError(message: string, validationErrors: Record<string, string>): AppError {
  const error = new AppError(message, 400);
  // Add validation errors as a property
  (error as any).validationErrors = validationErrors;
  return error;
}
