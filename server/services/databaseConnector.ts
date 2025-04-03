/**
 * Database Connector Service
 * 
 * Handles establishing and managing connections to SQLite databases.
 * Provides methods for validating connections and retrieving database metadata.
 */

import { DB } from "sqlite";
import * as configManager from "./configurationManager.ts";
import { exists } from "https://deno.land/std@0.170.0/fs/mod.ts";

// Map to cache database connections
const connectionCache: Map<number, DB> = new Map();

// Interface for connection parameters
export interface ConnectionParams {
  path: string;
  name: string;
}

// Interface for database metadata
export interface DatabaseMetadata {
  size: number;
  tableCount: number;
  tables: string[];
}

/**
 * Connect to an SQLite database
 * 
 * @param params Connection parameters
 * @returns Database connection
 */
export async function connectToDatabase(params: ConnectionParams): Promise<DB> {
  console.log(`Connecting to database: ${params.name} at ${params.path}`);
  
  try {
    // Check if file exists
    if (!(await exists(params.path))) {
      throw new Error(`Database file not found: ${params.path}`);
    }
    
    // Create a new connection
    const db = new DB(params.path, { readonly: true });
    
    // Test connection by executing a simple query
    db.query("SELECT 1");
    
    return db;
  } catch (error) {
    console.error("Connection error:", error);
    throw new Error(`Failed to connect to database: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get a cached database connection or create a new one
 * 
 * @param connectionId Connection ID
 * @returns Database connection
 */
export async function getConnection(connectionId: number): Promise<DB> {
  // Check if connection is in cache
  if (connectionCache.has(connectionId)) {
    return connectionCache.get(connectionId)!;
  }
  
  // Get connection details from config store
  const connectionDetails = await configManager.getConnection(connectionId);
  
  if (!connectionDetails) {
    throw new Error(`Connection not found with ID: ${connectionId}`);
  }
  
  // Update last accessed time
  await configManager.updateConnectionAccess(connectionId);
  
  // Create new connection
  try {
    const db = await connectToDatabase({
      name: connectionDetails.name,
      path: connectionDetails.path
    });
    
    // Cache the connection
    connectionCache.set(connectionId, db);
    
    return db;
  } catch (error) {
    // Update connection validity in config store
    await configManager.updateConnection({
      ...connectionDetails,
      isValid: false
    });
    
    throw error;
  }
}

/**
 * Get metadata about a database
 * 
 * @param path Path to the database file
 * @returns Database metadata
 */
export async function getDatabaseMetadata(path: string): Promise<DatabaseMetadata> {
  try {
    // Get file size
    const fileInfo = await Deno.stat(path);
    const size = fileInfo.size;
    
    // Connect to database to get table information
    const db = new DB(path, { readonly: true });
    
    try {
      // Get list of tables
      const tables = db.query<[string]>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      ).map(row => row[0]);
      
      return {
        size,
        tableCount: tables.length,
        tables
      };
    } finally {
      // Always close connection
      db.close();
    }
  } catch (error) {
    console.error(`Error getting metadata for database at ${path}:`, error);
    throw new Error(`Failed to get database metadata: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Validate database connection
 * 
 * @param path Path to the database file
 * @returns Boolean indicating if connection is valid
 */
export async function validateConnection(path: string): Promise<boolean> {
  try {
    // Check if file exists
    if (!(await exists(path))) {
      return false;
    }
    
    // Try to open the database
    const db = new DB(path, { readonly: true });
    
    try {
      // Execute simple query to verify connection
      db.query("SELECT 1");
      return true;
    } finally {
      // Always close connection
      db.close();
    }
  } catch (error) {
    console.error(`Error validating connection to ${path}:`, error);
    return false;
  }
}

/**
 * Close database connection
 * 
 * @param db Database connection to close
 */
export function closeConnection(db: DB): void {
  try {
    db.close();
  } catch (error) {
    console.error("Error closing database connection:", error);
  }
}

/**
 * Close connection by ID and remove from cache
 * 
 * @param connectionId Connection ID
 */
export function closeConnectionById(connectionId: number): void {
  const db = connectionCache.get(connectionId);
  
  if (db) {
    closeConnection(db);
    connectionCache.delete(connectionId);
  }
}

/**
 * Close all cached connections
 */
export function closeAllConnections(): void {
  for (const [id, db] of connectionCache.entries()) {
    closeConnection(db);
    connectionCache.delete(id);
  }
}

// Register close handler for clean shutdown
self.addEventListener("unload", () => {
  closeAllConnections();
});
