/**
 * Connection Model
 * 
 * Represents a database connection in the application.
 */

/**
 * Connection model interface
 */
export interface Connection {
  id: number;
  name: string;
  path: string;
  lastAccessed: Date;
  sizeBytes?: number;
  tableCount?: number;
  isValid: boolean;
}

/**
 * Create table SQL for connections
 */
export const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    size_bytes INTEGER,
    table_count INTEGER,
    is_valid BOOLEAN DEFAULT 1
  )
`;

/**
 * Insert connection SQL
 */
export const INSERT_CONNECTION_SQL = `
  INSERT INTO connections (name, path, size_bytes, table_count, is_valid)
  VALUES (?, ?, ?, ?, ?)
`;

/**
 * Get all connections SQL
 */
export const GET_CONNECTIONS_SQL = `
  SELECT 
    id, 
    name, 
    path, 
    last_accessed as lastAccessed, 
    size_bytes as sizeBytes, 
    table_count as tableCount, 
    is_valid as isValid
  FROM connections
  ORDER BY last_accessed DESC
`;

/**
 * Get connection by ID SQL
 */
export const GET_CONNECTION_SQL = `
  SELECT 
    id, 
    name, 
    path, 
    last_accessed as lastAccessed, 
    size_bytes as sizeBytes, 
    table_count as tableCount, 
    is_valid as isValid
  FROM connections
  WHERE id = ?
`;

/**
 * Update connection access time SQL
 */
export const UPDATE_ACCESS_SQL = `
  UPDATE connections
  SET last_accessed = CURRENT_TIMESTAMP
  WHERE id = ?
`;

/**
 * Delete connection SQL
 */
export const DELETE_CONNECTION_SQL = `
  DELETE FROM connections
  WHERE id = ?
`;
