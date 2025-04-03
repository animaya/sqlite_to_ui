/**
 * Table Service
 * 
 * Service for interacting with database tables.
 */

import * as api from "./api.ts";

export interface TableSchema {
  name: string;
  type: string;
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Get all tables for a connection
 * 
 * @param connectionId Connection ID
 * @returns List of table names
 */
export async function getTables(connectionId: number): Promise<string[]> {
  return api.get<string[]>(`/connections/${connectionId}/tables`);
}

/**
 * Get schema for a table
 * 
 * @param connectionId Connection ID
 * @param table Table name
 * @returns Table schema
 */
export async function getTableSchema(
  connectionId: number,
  table: string
): Promise<TableSchema[]> {
  return api.get<TableSchema[]>(`/connections/${connectionId}/tables/${table}/schema`);
}

/**
 * Get data from a table
 * 
 * @param connectionId Connection ID
 * @param table Table name
 * @param page Page number
 * @param pageSize Page size
 * @param sortColumn Column to sort by
 * @param sortDirection Sort direction
 * @param filters Column filters
 * @returns Table data
 */
export async function getTableData(
  connectionId: number,
  table: string,
  page = 1,
  pageSize = 10,
  sortColumn?: string,
  sortDirection?: 'asc' | 'desc',
  filters?: Record<string, string>
): Promise<QueryResult> {
  const params = new URLSearchParams();
  
  params.append('page', page.toString());
  params.append('pageSize', pageSize.toString());
  
  if (sortColumn) {
    params.append('sortColumn', sortColumn);
  }
  
  if (sortDirection) {
    params.append('sortDirection', sortDirection);
  }
  
  if (filters) {
    Object.entries(filters).forEach(([column, value]) => {
      if (value) {
        params.append(`filter[${column}]`, value);
      }
    });
  }
  
  return api.get<QueryResult>(
    `/connections/${connectionId}/tables/${table}/data?${params.toString()}`
  );
}

/**
 * Get a sample of data from a table
 * 
 * @param connectionId Connection ID
 * @param table Table name
 * @returns Sample data
 */
export async function getSampleData(
  connectionId: number,
  table: string
): Promise<Record<string, unknown>[]> {
  return api.get<Record<string, unknown>[]>(
    `/connections/${connectionId}/tables/${table}/data/sample`
  );
}
