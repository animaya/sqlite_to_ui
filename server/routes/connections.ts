/**
 * Connection API Routes
 * 
 * Handles API endpoints for database connections management.
 */

import { Handlers } from "fresh/server.ts";
import * as configManager from "../services/configurationManager.ts";
import * as dbConnector from "../services/databaseConnector.ts";
import * as queryProcessor from "../services/queryProcessor.ts";
import { createValidator } from "../middleware/dataValidator.ts";
import { AppError } from "../middleware/errorHandler.ts";

// Schema for connection creation
const connectionSchema = {
  name: {
    type: "string",
    required: true,
    min: 1,
    max: 100
  },
  path: {
    type: "string",
    required: true,
    min: 1,
    max: 500
  }
};

// Validation middleware for connection creation
const validateConnection = createValidator(connectionSchema);

export const handler: Handlers = {
  /**
   * GET /api/connections - List all saved connections
   */
  async GET(req, ctx) {
    try {
      const connections = await configManager.getConnections();
      
      return new Response(JSON.stringify(connections), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error fetching connections:", error);
      throw new AppError("Failed to fetch connections", 500);
    }
  },

  /**
   * POST /api/connections - Create a new connection
   */
  async POST(req, ctx) {
    const body = await req.json();
    
    // Validate connection parameters
    if (!body.name || !body.path) {
      throw new AppError("Name and path are required", 400);
    }
    
    try {
      // Check if file exists and is a valid SQLite database
      const isValid = await dbConnector.validateConnection(body.path);
      
      if (!isValid) {
        throw new AppError(`Invalid or inaccessible database at path: ${body.path}`, 400);
      }
      
      // Get database metadata
      const metadata = await dbConnector.getDatabaseMetadata(body.path);
      
      // Create the connection
      const connection = await configManager.saveConnection({
        name: body.name,
        path: body.path,
        sizeBytes: metadata.size,
        tableCount: metadata.tableCount,
        isValid: true
      });
      
      return new Response(JSON.stringify(connection), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      console.error("Error creating connection:", error);
      throw new AppError(`Failed to create connection: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  }
};

/**
 * Handler for connection detail operations
 */
export const connectionHandler: Handlers = {
  /**
   * GET /api/connections/:id - Get connection details
   */
  async GET(req, ctx) {
    const { id } = ctx.params;
    const connectionId = parseInt(id);
    
    if (isNaN(connectionId)) {
      throw new AppError("Invalid connection ID", 400);
    }
    
    try {
      const connection = await configManager.getConnection(connectionId);
      
      if (!connection) {
        throw new AppError(`Connection not found with ID: ${connectionId}`, 404);
      }
      
      return new Response(JSON.stringify(connection), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      console.error(`Error fetching connection ${connectionId}:`, error);
      throw new AppError(`Failed to fetch connection: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  },

  /**
   * DELETE /api/connections/:id - Remove a connection
   */
  async DELETE(req, ctx) {
    const { id } = ctx.params;
    const connectionId = parseInt(id);
    
    if (isNaN(connectionId)) {
      throw new AppError("Invalid connection ID", 400);
    }
    
    try {
      // Check if connection exists
      const connection = await configManager.getConnection(connectionId);
      
      if (!connection) {
        throw new AppError(`Connection not found with ID: ${connectionId}`, 404);
      }
      
      // Close connection if it's open
      dbConnector.closeConnectionById(connectionId);
      
      // Delete connection
      await configManager.deleteConnection(connectionId);
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      console.error(`Error deleting connection ${connectionId}:`, error);
      throw new AppError(`Failed to delete connection: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  }
};

/**
 * Handler for connection health check
 */
export const healthHandler: Handlers = {
  /**
   * GET /api/connections/:id/health - Check database health/size
   */
  async GET(req, ctx) {
    const { id } = ctx.params;
    const connectionId = parseInt(id);
    
    if (isNaN(connectionId)) {
      throw new AppError("Invalid connection ID", 400);
    }
    
    try {
      // Get connection details
      const connection = await configManager.getConnection(connectionId);
      
      if (!connection) {
        throw new AppError(`Connection not found with ID: ${connectionId}`, 404);
      }
      
      // Validate connection
      const isValid = await dbConnector.validateConnection(connection.path);
      
      if (!isValid) {
        // Update connection validity in config store
        await configManager.updateConnection({
          ...connection,
          isValid: false
        });
        
        return new Response(JSON.stringify({
          isValid: false,
          message: "Database file is inaccessible or not a valid SQLite database"
        }), {
          headers: { "Content-Type": "application/json" }
        });
      }
      
      // Get database metadata
      const metadata = await dbConnector.getDatabaseMetadata(connection.path);
      
      // Update connection with metadata
      const updatedConnection = await configManager.updateConnection({
        ...connection,
        sizeBytes: metadata.size,
        tableCount: metadata.tableCount,
        isValid: true
      });
      
      return new Response(JSON.stringify({
        isValid: true,
        sizeBytes: metadata.size,
        tableCount: metadata.tableCount,
        tables: metadata.tables
      }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error(`Error checking health for connection ${connectionId}:`, error);
      throw new AppError(`Failed to check database health: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  }
};
