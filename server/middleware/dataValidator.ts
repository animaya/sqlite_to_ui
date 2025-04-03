/**
 * Data Validator Middleware
 * 
 * Validates request data against schemas.
 */

import { MiddlewareHandler } from "fresh/server.ts";
import { AppError, createValidationError } from "./errorHandler.ts";

/**
 * Validation schema type
 */
export interface ValidationSchema {
  [key: string]: {
    type: string;
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: unknown[];
    custom?: (value: unknown) => boolean;
  };
}

/**
 * Validate data against schema
 * 
 * @param data Data to validate
 * @param schema Validation schema
 * @returns Validation result
 */
export function validateData(
  data: Record<string, unknown>,
  schema: ValidationSchema
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // Check each field against the schema
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    // Check required fields
    if (rules.required && (value === undefined || value === null || value === "")) {
      errors[field] = `${field} is required`;
      continue;
    }
    
    // Skip validation for optional fields that are not provided
    if ((value === undefined || value === null || value === "") && !rules.required) {
      continue;
    }
    
    // Type validation
    if (rules.type) {
      let typeValid = false;
      
      switch(rules.type) {
        case 'string':
          typeValid = typeof value === 'string';
          break;
        case 'number':
          typeValid = typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)));
          break;
        case 'boolean':
          typeValid = typeof value === 'boolean' || value === 'true' || value === 'false';
          break;
        case 'object':
          typeValid = typeof value === 'object' && value !== null;
          break;
        case 'array':
          typeValid = Array.isArray(value);
          break;
      }
      
      if (!typeValid) {
        errors[field] = `${field} must be a ${rules.type}`;
        continue;
      }
    }
    
    // Numeric range validation
    if ((rules.min !== undefined || rules.max !== undefined) && 
        (rules.type === 'number' || typeof value === 'number')) {
      const numValue = typeof value === 'string' ? Number(value) : value as number;
      
      if (rules.min !== undefined && numValue < rules.min) {
        errors[field] = `${field} must be at least ${rules.min}`;
      }
      
      if (rules.max !== undefined && numValue > rules.max) {
        errors[field] = `${field} must be at most ${rules.max}`;
      }
    }
    
    // String length validation
    if ((rules.min !== undefined || rules.max !== undefined) && 
        (rules.type === 'string' || typeof value === 'string')) {
      const strValue = value as string;
      
      if (rules.min !== undefined && strValue.length < rules.min) {
        errors[field] = `${field} must be at least ${rules.min} characters`;
      }
      
      if (rules.max !== undefined && strValue.length > rules.max) {
        errors[field] = `${field} must be at most ${rules.max} characters`;
      }
    }
    
    // Pattern validation
    if (rules.pattern && (rules.type === 'string' || typeof value === 'string')) {
      if (!rules.pattern.test(value as string)) {
        errors[field] = `${field} has an invalid format`;
      }
    }
    
    // Enum validation
    if (rules.enum && rules.enum.length > 0) {
      if (!rules.enum.includes(value)) {
        const options = rules.enum.join(', ');
        errors[field] = `${field} must be one of: ${options}`;
      }
    }
    
    // Custom validation
    if (rules.custom && typeof rules.custom === 'function') {
      if (!rules.custom(value)) {
        errors[field] = `${field} is invalid`;
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Create a validator middleware
 * 
 * @param schema Validation schema
 * @returns Middleware handler
 */
export function createValidator(schema: ValidationSchema): MiddlewareHandler {
  return async (req, ctx) => {
    if (req.method === "POST" || req.method === "PUT") {
      // Parse request body as JSON
      let body: Record<string, unknown>;
      
      try {
        body = await req.json();
      } catch (error) {
        throw new AppError("Invalid JSON in request body", 400);
      }
      
      // Validate against schema
      const validation = validateData(body, schema);
      
      if (!validation.valid) {
        throw createValidationError("Validation failed", validation.errors);
      }
      
      // Add validated body to context state for handlers to use
      ctx.state.validatedBody = body;
    }
    
    return ctx.next();
  };
}

/**
 * Create a query validator middleware
 * 
 * @param schema Validation schema
 * @returns Middleware handler
 */
export function createQueryValidator(schema: ValidationSchema): MiddlewareHandler {
  return async (req, ctx) => {
    const url = new URL(req.url);
    const queryParams: Record<string, unknown> = {};
    
    // Convert URLSearchParams to a plain object
    for (const [key, value] of url.searchParams.entries()) {
      queryParams[key] = value;
    }
    
    // Validate against schema
    const validation = validateData(queryParams, schema);
    
    if (!validation.valid) {
      throw createValidationError("Query parameter validation failed", validation.errors);
    }
    
    // Add validated query to context state for handlers to use
    ctx.state.validatedQuery = queryParams;
    
    return ctx.next();
  };
}
