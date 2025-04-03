/**
 * Tables API Routes
 * 
 * Handles API endpoints for database table operations.
 */

import { Handlers } from "fresh/server.ts";
import * as configManager from "../services/configurationManager.ts";
import * as dbConnector from "../services/databaseConnector.ts";
import * as queryProcessor from "../services/queryProcessor.ts";
import { AppError } from "../middleware/errorHandler.ts";

export const handler: Handlers = {
  /**
   * GET /api/connections/:id/tables - List all tables in the database
   */
  async GET(req, ctx) {
    const { id } = ctx.params;
    const connectionId = parseInt(id);
    
    if (isNaN(connectionId)) {
      throw new AppError("Invalid connection ID", 400);
    }
    
    try {
      // Get the connection 
      const connection = await configManager.getConnection(connectionId);
      
      if (!connection) {
        throw new AppError(`Connection not found with ID: ${connectionId}`, 404);
      }
      
      if (!connection.isValid) {
        throw new AppError(`Connection is invalid: ${connection.path}`, 400);
      }
      
      // Get database connection
      const db = await dbConnector.getConnection(connectionId);
      
      // Get all tables
      const tables = await queryProcessor.getTables(db);
      
      return new Response(JSON.stringify(tables), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      console.error(`Error listing tables for connection ${connectionId}:`, error);
      throw new AppError(`Failed to list tables: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  }
};

/**
 * Handler for table schema
 */
export const schemaHandler: Handlers = {
  /**
   * GET /api/connections/:id/tables/:table/schema - Get table schema
   */
  async GET(req, ctx) {
    const { id, table } = ctx.params;
    const connectionId = parseInt(id);
    
    if (isNaN(connectionId)) {
      throw new AppError("Invalid connection ID", 400);
    }
    
    if (!table) {
      throw new AppError("Table name is required", 400);
    }
    
    try {
      // Get the connection 
      const connection = await configManager.getConnection(connectionId);
      
      if (!connection) {
        throw new AppError(`Connection not found with ID: ${connectionId}`, 404);
      }
      
      if (!connection.isValid) {
        throw new AppError(`Connection is invalid: ${connection.path}`, 400);
      }
      
      // Get database connection
      const db = await dbConnector.getConnection(connectionId);
      
      // Get table schema
      const schema = await queryProcessor.getTableSchema(db, table);
      
      return new Response(JSON.stringify(schema), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      console.error(`Error getting schema for table ${table} on connection ${connectionId}:`, error);
      throw new AppError(`Failed to get table schema: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  }
};

/**
 * Handler for table data
 */
export const dataHandler: Handlers = {
  /**
   * GET /api/connections/:id/tables/:table/data - Get table data (with pagination)
   */
  async GET(req, ctx) {
    const { id, table } = ctx.params;
    const connectionId = parseInt(id);
    
    if (isNaN(connectionId)) {
      throw new AppError("Invalid connection ID", 400);
    }
    
    if (!table) {
      throw new AppError("Table name is required", 400);
    }
    
    try {
      // Get the connection 
      const connection = await configManager.getConnection(connectionId);
      
      if (!connection) {
        throw new AppError(`Connection not found with ID: ${connectionId}`, 404);
      }
      
      if (!connection.isValid) {
        throw new AppError(`Connection is invalid: ${connection.path}`, 400);
      }
      
      // Parse query parameters
      const url = new URL(req.url);
      
      const page = parseInt(url.searchParams.get("page") || "1");
      const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
      const sortColumn = url.searchParams.get("sortColumn") || undefined;
      const sortDirection = (url.searchParams.get("sortDirection") || "asc") as "asc" | "desc";
      
      // Parse filters from query parameters
      const filters: Record<string, unknown> = {};
      
      for (const [key, value] of url.searchParams.entries()) {
        if (key.startsWith("filter[") && key.endsWith("]")) {
          const filterKey = key.slice(7, -1);
          filters[filterKey] = value;
        }
      }
      
      // Get database connection
      const db = await dbConnector.getConnection(connectionId);
      
      // Fetch table data
      const result = await queryProcessor.executeQuery(db, {
        table,
        page,
        pageSize,
        sortColumn,
        sortDirection,
        filters
      });
      
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      console.error(`Error getting data for table ${table} on connection ${connectionId}:`, error);
      throw new AppError(`Failed to get table data: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  }
};

/**
 * Handler for table data sampling
 */
export const sampleHandler: Handlers = {
  /**
   * GET /api/connections/:id/tables/:table/data/sample - Get a sample of table data
   */
  async GET(req, ctx) {
    const { id, table } = ctx.params;
    const connectionId = parseInt(id);
    
    if (isNaN(connectionId)) {
      throw new AppError("Invalid connection ID", 400);
    }
    
    if (!table) {
      throw new AppError("Table name is required", 400);
    }
    
    try {
      // Get the connection 
      const connection = await configManager.getConnection(connectionId);
      
      if (!connection) {
        throw new AppError(`Connection not found with ID: ${connectionId}`, 404);
      }
      
      if (!connection.isValid) {
        throw new AppError(`Connection is invalid: ${connection.path}`, 400);
      }
      
      // Parse sample size from query parameters
      const url = new URL(req.url);
      const sampleSize = parseInt(url.searchParams.get("size") || "100");
      
      // Get database connection
      const db = await dbConnector.getConnection(connectionId);
      
      // Get sample data
      const sample = await queryProcessor.getSampleData(db, table, sampleSize);
      
      return new Response(JSON.stringify(sample), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      console.error(`Error getting sample for table ${table} on connection ${connectionId}:`, error);
      throw new AppError(`Failed to get sample data: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  }
};
