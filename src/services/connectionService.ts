/**
 * Connection Service
 * 
 * Service for managing database connections.
 */

import * as api from "./api.ts";

export interface Connection {
  id: number;
  name: string;
  path: string;
  lastAccessed: string;
  sizeBytes?: number;
  tableCount?: number;
  isValid: boolean;
}

/**
 * Get all database connections
 * 
 * @returns List of connections
 */
export async function getConnections(): Promise<Connection[]> {
  return api.get<Connection[]>("/connections");
}

/**
 * Get a connection by ID
 * 
 * @param id Connection ID
 * @returns Connection details
 */
export async function getConnection(id: number): Promise<Connection> {
  return api.get<Connection>(`/connections/${id}`);
}

/**
 * Create a new connection
 * 
 * @param name Connection name
 * @param path Database file path
 * @returns Created connection
 */
export async function createConnection(
  name: string,
  path: string
): Promise<Connection> {
  return api.post<Connection>("/connections", { name, path });
}

/**
 * Delete a connection
 * 
 * @param id Connection ID
 * @returns Success result
 */
export async function deleteConnection(id: number): Promise<{ success: boolean }> {
  return api.del<{ success: boolean }>(`/connections/${id}`);
}

/**
 * Check database health
 * 
 * @param id Connection ID
 * @returns Health check result
 */
export async function checkHealth(id: number): Promise<{ 
  isValid: boolean;
  sizeBytes?: number;
  tableCount?: number;
}> {
  return api.get<{
    isValid: boolean;
    sizeBytes?: number;
    tableCount?: number;
  }>(`/connections/${id}/health`);
}
