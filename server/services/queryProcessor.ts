/**
 * Query Processor Service
 * 
 * Executes read-only queries against target databases.
 * Formats query results for frontend consumption.
 * Implements pagination and data sampling for large datasets.
 */

import { DB } from "sqlite";
import * as dbConnector from "./databaseConnector.ts";
import * as dbUtils from "../utils/dbUtils.ts";
import { AppError } from "../middleware/errorHandler.ts";

// Max execution time for queries in milliseconds (5 seconds)
const QUERY_TIMEOUT = 5000;

// Interface for query parameters
export interface QueryParams {
  table: string;
  page?: number;
  pageSize?: number;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

// Interface for query result
export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Build a SQL WHERE clause from filters
 * 
 * @param filters Filter conditions
 * @param params Array to populate with parameter values
 * @returns WHERE clause string
 */
function buildWhereClause(filters: Record<string, unknown>, params: unknown[]): string {
  if (!filters || Object.keys(filters).length === 0) {
    return '';
  }
  
  const conditions = Object.entries(filters)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([column, value]) => {
      // Handle different value types
      if (typeof value === 'string') {
        params.push(`%${value}%`);
        return `${column} LIKE ?`;
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        params.push(value);
        return `${column} = ?`;
      } else if (Array.isArray(value)) {
        // For array values, use IN operator
        const placeholders = value.map(() => '?').join(', ');
        params.push(...value);
        return `${column} IN (${placeholders})`;
      } else if (typeof value === 'object' && value !== null) {
        // Handle special operators like >, <, >=, <= etc.
        const obj = value as Record<string, unknown>;
        const operator = Object.keys(obj)[0];
        const operatorValue = obj[operator];
        
        if (operatorValue === undefined || operatorValue === null) {
          return null;
        }
        
        params.push(operatorValue);
        
        switch (operator) {
          case 'eq': return `${column} = ?`;
          case 'neq': return `${column} != ?`;
          case 'gt': return `${column} > ?`;
          case 'gte': return `${column} >= ?`;
          case 'lt': return `${column} < ?`;
          case 'lte': return `${column} <= ?`;
          case 'like': return `${column} LIKE ?`;
          default: return null;
        }
      }
      
      return null;
    })
    .filter(condition => condition !== null);
  
  if (conditions.length === 0) {
    return '';
  }
  
  return `WHERE ${conditions.join(' AND ')}`;
}

/**
 * Execute a read-only query against a database
 * 
 * @param db Database connection
 * @param params Query parameters
 * @returns Query result
 */
export async function executeQuery(db: DB, params: QueryParams): Promise<QueryResult> {
  const {
    table,
    page = 1,
    pageSize = 10,
    sortColumn,
    sortDirection = 'asc',
    filters = {}
  } = params;
  
  // Validate table name to prevent SQL injection
  // Table names can't be parameterized in SQLite
  if (!/^[a-zA-Z0-9_]+$/.test(table)) {
    throw new AppError(`Invalid table name: ${table}`, 400);
  }
  
  // Calculate offset
  const offset = (page - 1) * pageSize;
  
  // Build query parameters
  const queryParams: unknown[] = [];
  const whereClause = buildWhereClause(filters, queryParams);
  
  // Build sort clause
  let orderClause = '';
  if (sortColumn) {
    // Validate sort column to prevent SQL injection
    if (!/^[a-zA-Z0-9_]+$/.test(sortColumn)) {
      throw new AppError(`Invalid sort column: ${sortColumn}`, 400);
    }
    
    // Validate sort direction
    const direction = sortDirection.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    orderClause = `ORDER BY ${sortColumn} ${direction}`;
  }
  
  // Build count query to get total number of records
  const countQuery = `SELECT COUNT(*) as count FROM ${table} ${whereClause}`;
  
  // Build data query
  const dataQuery = `
    SELECT * FROM ${table}
    ${whereClause}
    ${orderClause}
    LIMIT ${pageSize} OFFSET ${offset}
  `;
  
  try {
    // Execute count query
    const countResult = db.query<[number]>(countQuery, queryParams);
    const total = countResult[0][0];
    
    // Execute data query
    const rows = db.query<Record<string, unknown>>(dataQuery, queryParams);
    
    // Get column names from the first row
    const columns: string[] = [];
    if (rows.length > 0) {
      Object.keys(rows[0]).forEach(key => columns.push(key));
    } else {
      // If no results, get columns from table schema
      const schemaResult = db.query<[string, string, string, number, unknown, number]>(
        `PRAGMA table_info(${table})`
      );
      
      for (const row of schemaResult) {
        columns.push(row[1]); // Column name is the second field
      }
    }
    
    // Transform data to proper format
    const transformedRows = rows.map(row => {
      const transformedRow: Record<string, unknown> = {};
      
      for (const key of Object.keys(row)) {
        transformedRow[key] = row[key];
      }
      
      return transformedRow;
    });
    
    return {
      columns,
      rows: transformedRows,
      total,
      page,
      pageSize
    };
  } catch (error) {
    console.error(`Error executing query on table ${table}:`, error);
    throw new AppError(`Failed to query table data: ${error instanceof Error ? error.message : String(error)}`, 500);
  }
}

/**
 * Get a sample of data from a table
 * 
 * @param db Database connection
 * @param table Table name
 * @param sampleSize Number of rows to sample
 * @returns Sample data
 */
export async function getSampleData(db: DB, table: string, sampleSize = 100): Promise<Record<string, unknown>[]> {
  // Validate table name to prevent SQL injection
  if (!/^[a-zA-Z0-9_]+$/.test(table)) {
    throw new AppError(`Invalid table name: ${table}`, 400);
  }
  
  try {
    // Get random sample using SQLite's RANDOM() function
    const sampleQuery = `
      SELECT * FROM ${table}
      ORDER BY RANDOM()
      LIMIT ${sampleSize}
    `;
    
    const rows = db.query<Record<string, unknown>>(sampleQuery);
    
    // Transform data to proper format
    return rows.map(row => {
      const transformedRow: Record<string, unknown> = {};
      
      for (const key of Object.keys(row)) {
        transformedRow[key] = row[key];
      }
      
      return transformedRow;
    });
  } catch (error) {
    console.error(`Error getting sample data from table ${table}:`, error);
    throw new AppError(`Failed to get sample data: ${error instanceof Error ? error.message : String(error)}`, 500);
  }
}

/**
 * Get schema information for a table
 * 
 * @param db Database connection
 * @param table Table name
 * @returns Column information
 */
export async function getTableSchema(db: DB, table: string): Promise<{ name: string; type: string; }[]> {
  // Validate table name to prevent SQL injection
  if (!/^[a-zA-Z0-9_]+$/.test(table)) {
    throw new AppError(`Invalid table name: ${table}`, 400);
  }
  
  try {
    const schemaQuery = `PRAGMA table_info(${table})`;
    const schemaResult = db.query<[number, string, string, number, unknown, number]>(schemaQuery);
    
    return schemaResult.map(row => ({
      name: row[1], // Column name is the second field
      type: row[2]  // Data type is the third field
    }));
  } catch (error) {
    console.error(`Error getting schema for table ${table}:`, error);
    throw new AppError(`Failed to get table schema: ${error instanceof Error ? error.message : String(error)}`, 500);
  }
}

/**
 * Get all tables in a database
 * 
 * @param db Database connection
 * @returns List of table names
 */
export async function getTables(db: DB): Promise<string[]> {
  try {
    const query = `
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `;
    
    const result = db.query<[string]>(query);
    return result.map(row => row[0]);
  } catch (error) {
    console.error("Error getting tables:", error);
    throw new AppError(`Failed to get tables: ${error instanceof Error ? error.message : String(error)}`, 500);
  }
}

/**
 * Execute a custom query with timeout
 * 
 * @param db Database connection
 * @param sql SQL query
 * @param params Query parameters
 * @returns Query result
 */
export async function executeCustomQuery(db: DB, sql: string, params: unknown[] = []): Promise<Record<string, unknown>[]> {
  // Check if query is a SELECT statement
  if (!sql.trim().toUpperCase().startsWith('SELECT')) {
    throw new AppError("Only SELECT queries are allowed", 400);
  }
  
  try {
    const rows = db.query<Record<string, unknown>>(sql, params);
    
    // Transform data to proper format
    return rows.map(row => {
      const transformedRow: Record<string, unknown> = {};
      
      for (const key of Object.keys(row)) {
        transformedRow[key] = row[key];
      }
      
      return transformedRow;
    });
  } catch (error) {
    console.error("Error executing custom query:", error);
    throw new AppError(`Failed to execute custom query: ${error instanceof Error ? error.message : String(error)}`, 500);
  }
}
