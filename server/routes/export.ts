/**
 * Export API Routes
 * 
 * Handles API endpoints for data export functionality.
 */

import { Handlers } from "fresh/server.ts";
import * as exportService from "../services/exportService.ts";
import * as configManager from "../services/configurationManager.ts";
import * as visualizationService from "../services/visualizationService.ts";
import { AppError } from "../middleware/errorHandler.ts";

/**
 * Handler for visualization export
 */
export const visualizationExportHandler: Handlers = {
  /**
   * GET /api/export/csv/:vizId - Export visualization as CSV
   */
  async GET(req, ctx) {
    const { vizId } = ctx.params;
    const visualizationId = parseInt(vizId);
    
    if (isNaN(visualizationId)) {
      throw new AppError("Invalid visualization ID", 400);
    }
    
    try {
      // Get visualization details to use for filename
      const visualization = await visualizationService.getVisualizationById(visualizationId);
      
      if (!visualization) {
        throw new AppError(`Visualization not found with ID: ${visualizationId}`, 404);
      }
      
      // Generate CSV
      const csvData = await exportService.exportVisualizationAsCSV(visualizationId);
      
      // Generate filename
      const filename = exportService.generateExportFilename(visualization.name);
      
      return new Response(csvData, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}"`
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      console.error(`Error exporting visualization ${visualizationId}:`, error);
      throw new AppError(`Failed to export visualization: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  }
};

/**
 * Handler for table export
 */
export const tableExportHandler: Handlers = {
  /**
   * GET /api/export/csv/table/:connectionId/:tableName - Export table as CSV
   */
  async GET(req, ctx) {
    const { connectionId, tableName } = ctx.params;
    const connId = parseInt(connectionId);
    
    if (isNaN(connId)) {
      throw new AppError("Invalid connection ID", 400);
    }
    
    if (!tableName) {
      throw new AppError("Table name is required", 400);
    }
    
    try {
      // Get connection details
      const connection = await configManager.getConnection(connId);
      
      if (!connection) {
        throw new AppError(`Connection not found with ID: ${connId}`, 404);
      }
      
      // Parse filters from query parameters
      const url = new URL(req.url);
      const filters: Record<string, unknown> = {};
      
      for (const [key, value] of url.searchParams.entries()) {
        if (key.startsWith("filter[") && key.endsWith("]")) {
          const filterKey = key.slice(7, -1);
          filters[filterKey] = value;
        }
      }
      
      // Generate CSV
      const csvData = await exportService.exportTableAsCSV(connId, tableName, filters);
      
      // Generate filename
      const filename = exportService.generateExportFilename(`${connection.name}_${tableName}`);
      
      return new Response(csvData, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}"`
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      console.error(`Error exporting table ${tableName} for connection ${connectionId}:`, error);
      throw new AppError(`Failed to export table: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  }
};
