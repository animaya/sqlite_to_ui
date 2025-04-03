/**
 * Visualization Model
 * 
 * Represents a saved visualization in the application.
 */

/**
 * Chart configuration interface
 */
export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  table: string;
  xField: string;
  yField: string;
  groupBy?: string;
  filters?: Record<string, unknown>;
  options?: Record<string, unknown>;
}

/**
 * Visualization model interface
 */
export interface Visualization {
  id: number;
  connectionId: number;
  name: string;
  type: string;
  config: ChartConfig;
  tableName: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create table SQL for visualizations
 */
export const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS saved_visualizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    connection_id INTEGER,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    config TEXT NOT NULL,
    table_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (connection_id) REFERENCES connections(id) ON DELETE CASCADE
  )
`;

/**
 * Insert visualization SQL
 */
export const INSERT_VISUALIZATION_SQL = `
  INSERT INTO saved_visualizations (
    connection_id, name, type, config, table_name
  )
  VALUES (?, ?, ?, ?, ?)
`;

/**
 * Get all visualizations SQL
 */
export const GET_VISUALIZATIONS_SQL = `
  SELECT 
    id,
    connection_id as connectionId,
    name,
    type,
    config,
    table_name as tableName,
    created_at as createdAt,
    updated_at as updatedAt
  FROM saved_visualizations
  ORDER BY updated_at DESC
`;

/**
 * Get visualization by ID SQL
 */
export const GET_VISUALIZATION_SQL = `
  SELECT 
    id,
    connection_id as connectionId,
    name,
    type,
    config,
    table_name as tableName,
    created_at as createdAt,
    updated_at as updatedAt
  FROM saved_visualizations
  WHERE id = ?
`;

/**
 * Update visualization SQL
 */
export const UPDATE_VISUALIZATION_SQL = `
  UPDATE saved_visualizations
  SET name = ?, type = ?, config = ?, table_name = ?, updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`;

/**
 * Delete visualization SQL
 */
export const DELETE_VISUALIZATION_SQL = `
  DELETE FROM saved_visualizations
  WHERE id = ?
`;
