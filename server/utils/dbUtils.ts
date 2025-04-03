/**
 * Database Utilities
 * 
 * Helper functions for working with databases.
 */

import { DB } from "sqlite";

/**
 * Open the application SQLite database
 * 
 * @returns Database connection
 */
export function openAppDatabase(): DB {
  try {
    return new DB("sqlite_visualizer_app.db");
  } catch (error) {
    console.error("Failed to open application database:", error);
    throw new Error("Could not connect to application database");
  }
}

/**
 * Execute a query and transform row objects
 * 
 * @param db Database connection
 * @param sql SQL query
 * @param params Query parameters
 * @returns Transformed rows
 */
export function queryWithTransform<T>(
  db: DB,
  sql: string,
  params: unknown[] = []
): T[] {
  try {
    const result = db.query<Record<string, unknown>>(sql, params);
    return result.map((row) => transformRow<T>(row));
  } catch (error) {
    console.error("Query execution error:", error);
    console.error("SQL:", sql);
    console.error("Params:", params);
    throw new Error(`Database query failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Transform a database row by converting snake_case to camelCase
 * and parsing special values
 * 
 * @param row Database row
 * @returns Transformed row
 */
function transformRow<T>(row: Record<string, unknown>): T {
  const transformed: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(row)) {
    const camelKey = snakeToCamelCase(key);
    transformed[camelKey] = parseDbValue(value);
  }
  
  return transformed as T;
}

/**
 * Convert snake_case keys to camelCase
 * 
 * @param str String in snake_case
 * @returns String in camelCase
 */
export function snakeToCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Parse database serialized objects
 * 
 * @param value String value to parse
 * @returns Parsed value
 */
export function parseDbValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return null;
  }
  
  // Handle boolean values stored as integers
  if (value === 0 || value === 1) {
    return Boolean(value);
  }
  
  // Handle serialized JSON
  if (typeof value === "string") {
    if (value.startsWith("{") || value.startsWith("[")) {
      try {
        return JSON.parse(value);
      } catch {
        // Not valid JSON, return as string
        return value;
      }
    }
    
    // Handle date strings (ISO format)
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/.test(value)) {
      return new Date(value);
    }
  }
  
  return value;
}

/**
 * Execute a query that doesn't return results
 * 
 * @param db Database connection
 * @param sql SQL query
 * @param params Query parameters
 */
export function executeQuery(
  db: DB,
  sql: string,
  params: unknown[] = []
): void {
  try {
    db.query(sql, params);
  } catch (error) {
    console.error("Query execution error:", error);
    console.error("SQL:", sql);
    console.error("Params:", params);
    throw new Error(`Database query failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get a single row from a query
 * 
 * @param db Database connection
 * @param sql SQL query
 * @param params Query parameters
 * @returns Single row or null if not found
 */
export function querySingleRow<T>(
  db: DB,
  sql: string,
  params: unknown[] = []
): T | null {
  const rows = queryWithTransform<T>(db, sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Check if a table exists in the database
 * 
 * @param db Database connection
 * @param tableName Table name to check
 * @returns Boolean indicating if table exists
 */
export function tableExists(db: DB, tableName: string): boolean {
  const result = db.query<{name: string}>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name = ?",
    [tableName]
  );
  return result.length > 0;
}
