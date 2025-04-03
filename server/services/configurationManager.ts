/**
 * Configuration Manager Service
 * 
 * Manages application settings.
 * Stores and retrieves connection history.
 * Handles saved visualization persistence.
 */

import { DB } from "sqlite";
import * as dbUtils from "../utils/dbUtils.ts";
import { 
  CREATE_TABLE_SQL, 
  INSERT_CONNECTION_SQL, 
  GET_CONNECTIONS_SQL, 
  GET_CONNECTION_SQL, 
  UPDATE_ACCESS_SQL, 
  DELETE_CONNECTION_SQL 
} from "../models/connection.ts";
import { CREATE_TABLE_SQL as CREATE_VISUALIZATIONS_TABLE } from "../models/visualization.ts";
import { CREATE_TABLE_SQL as CREATE_TEMPLATES_TABLE } from "../models/template.ts";

// Interface for database connection
export interface Connection {
  id: number;
  name: string;
  path: string;
  lastAccessed: Date;
  sizeBytes?: number;
  tableCount?: number;
  isValid: boolean;
}

// Application DB instance
let appDb: DB | null = null;

/**
 * Get application database instance
 * 
 * @returns Database connection
 */
function getAppDb(): DB {
  if (!appDb) {
    appDb = dbUtils.openAppDatabase();
  }
  return appDb;
}

/**
 * Initialize application database
 */
export async function initAppDatabase(): Promise<void> {
  console.log("Initializing application database...");
  const db = getAppDb();
  
  try {
    // Create tables if they don't exist
    db.execute(CREATE_TABLE_SQL);
    console.log("Ensured connections table exists");
    
    db.execute(CREATE_VISUALIZATIONS_TABLE);
    console.log("Ensured visualizations table exists");
    
    db.execute(CREATE_TEMPLATES_TABLE);
    console.log("Ensured templates table exists");
    
    console.log("Application database initialization complete");
  } catch (error) {
    console.error("Error initializing application database:", error);
    throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Save a database connection
 * 
 * @param connection Connection to save
 * @returns Saved connection with ID
 */
export async function saveConnection(
  connection: Omit<Connection, 'id' | 'lastAccessed'>
): Promise<Connection> {
  const db = getAppDb();
  
  try {
    const result = db.query(
      INSERT_CONNECTION_SQL,
      [
        connection.name,
        connection.path,
        connection.sizeBytes,
        connection.tableCount,
        connection.isValid ? 1 : 0
      ]
    );
    
    const id = db.lastInsertRowId;
    
    return {
      id: Number(id),
      name: connection.name,
      path: connection.path,
      lastAccessed: new Date(),
      sizeBytes: connection.sizeBytes,
      tableCount: connection.tableCount,
      isValid: connection.isValid
    };
  } catch (error) {
    console.error("Error saving connection:", error);
    throw new Error(`Failed to save connection: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get all saved connections
 * 
 * @returns List of connections
 */
export async function getConnections(): Promise<Connection[]> {
  const db = getAppDb();
  
  try {
    return dbUtils.queryWithTransform<Connection>(db, GET_CONNECTIONS_SQL);
  } catch (error) {
    console.error("Error fetching connections:", error);
    throw new Error(`Failed to fetch connections: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get a connection by ID
 * 
 * @param id Connection ID
 * @returns Connection or null if not found
 */
export async function getConnection(id: number): Promise<Connection | null> {
  const db = getAppDb();
  
  try {
    return dbUtils.querySingleRow<Connection>(db, GET_CONNECTION_SQL, [id]);
  } catch (error) {
    console.error(`Error fetching connection with ID ${id}:`, error);
    throw new Error(`Failed to fetch connection: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Update a connection's last accessed time
 * 
 * @param id Connection ID
 */
export async function updateConnectionAccess(id: number): Promise<void> {
  const db = getAppDb();
  
  try {
    dbUtils.executeQuery(db, UPDATE_ACCESS_SQL, [id]);
  } catch (error) {
    console.error(`Error updating access time for connection ${id}:`, error);
    throw new Error(`Failed to update connection access time: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Delete a connection
 * 
 * @param id Connection ID
 * @returns Boolean indicating success
 */
export async function deleteConnection(id: number): Promise<boolean> {
  const db = getAppDb();
  
  try {
    dbUtils.executeQuery(db, DELETE_CONNECTION_SQL, [id]);
    return true;
  } catch (error) {
    console.error(`Error deleting connection ${id}:`, error);
    throw new Error(`Failed to delete connection: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Update a connection
 * 
 * @param connection Connection data to update
 * @returns Updated connection
 */
export async function updateConnection(connection: Connection): Promise<Connection> {
  const db = getAppDb();
  
  try {
    const sql = `
      UPDATE connections 
      SET name = ?, path = ?, size_bytes = ?, table_count = ?, is_valid = ?
      WHERE id = ?
    `;
    
    dbUtils.executeQuery(db, sql, [
      connection.name,
      connection.path,
      connection.sizeBytes,
      connection.tableCount,
      connection.isValid ? 1 : 0,
      connection.id
    ]);
    
    // Update access time as well
    await updateConnectionAccess(connection.id);
    
    return {
      ...connection,
      lastAccessed: new Date()
    };
  } catch (error) {
    console.error(`Error updating connection ${connection.id}:`, error);
    throw new Error(`Failed to update connection: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Close database connections when application shuts down
 */
export function closeConnections(): void {
  if (appDb) {
    try {
      appDb.close();
      appDb = null;
    } catch (error) {
      console.error("Error closing application database:", error);
    }
  }
}

// Register close handler for clean shutdown
self.addEventListener("unload", () => {
  closeConnections();
});
