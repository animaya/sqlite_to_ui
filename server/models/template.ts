/**
 * Template Model
 * 
 * Represents an insight template in the application.
 */

/**
 * Template model interface
 */
export interface InsightTemplate {
  id: number;
  name: string;
  description: string;
  type: string;
  config: Record<string, unknown>;
  category: string;
  isDefault: boolean;
}

/**
 * Create table SQL for templates
 */
export const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS insight_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    config TEXT NOT NULL,
    category TEXT,
    is_default BOOLEAN DEFAULT 0
  )
`;

/**
 * Insert template SQL
 */
export const INSERT_TEMPLATE_SQL = `
  INSERT INTO insight_templates (
    name, description, type, config, category, is_default
  )
  VALUES (?, ?, ?, ?, ?, ?)
`;

/**
 * Get all templates SQL
 */
export const GET_TEMPLATES_SQL = `
  SELECT 
    id,
    name,
    description,
    type,
    config,
    category,
    is_default as isDefault
  FROM insight_templates
  ORDER BY name
`;

/**
 * Get template by ID SQL
 */
export const GET_TEMPLATE_SQL = `
  SELECT 
    id,
    name,
    description,
    type,
    config,
    category,
    is_default as isDefault
  FROM insight_templates
  WHERE id = ?
`;

/**
 * Get templates by category SQL
 */
export const GET_TEMPLATES_BY_CATEGORY_SQL = `
  SELECT 
    id,
    name,
    description,
    type,
    config,
    category,
    is_default as isDefault
  FROM insight_templates
  WHERE category = ?
  ORDER BY name
`;
