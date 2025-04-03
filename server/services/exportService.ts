/**
 * Export Service
 * 
 * Formats data for CSV export.
 * Handles file generation and delivery.
 */

import * as dbConnector from "./databaseConnector.ts";
import * as queryProcessor from "./queryProcessor.ts";
import * as configManager from "./configurationManager.ts";
import * as visualizationService from "./visualizationService.ts";
import { AppError } from "../middleware/errorHandler.ts";

/**
 * Convert data to CSV format
 * 
 * @param data Array of objects to convert to CSV
 * @param columns Optional array of column names to include
 * @returns CSV string
 */
export function convertToCSV(
  data: Record<string, unknown>[],
  columns?: string[]
): string {
  if (data.length === 0) {
    return columns ? columns.join(',') + '\n' : '';
  }
  
  // If columns not specified, use keys from first data object
  const headers = columns || Object.keys(data[0]);
  
  // Create CSV header row
  let csv = headers.join(',') + '\n';
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      
      // Handle different value types
      if (value === null || value === undefined) {
        return '';
      } else if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if needed
        const escaped = value.replace(/"/g, '""');
        return /[,"\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
      } else if (value instanceof Date) {
        return value.toISOString();
      } else if (typeof value === 'object') {
        // Convert objects to JSON strings
        const json = JSON.stringify(value).replace(/"/g, '""');
        return `"${json}"`;
      }
      
      return String(value);
    });
    
    csv += values.join(',') + '\n';
  }
  
  return csv;
}

/**
 * Export visualization data as CSV
 * 
 * @param visualizationId ID of the visualization to export
 * @returns CSV data
 */
export async function exportVisualizationAsCSV(visualizationId: number): Promise<string> {
  try {
    // Get visualization details
    const visualization = await visualizationService.getVisualizationById(visualizationId);
    
    if (!visualization) {
      throw new AppError(`Visualization not found with ID: ${visualizationId}`, 404);
    }
    
    // Get the database connection
    const db = await dbConnector.getConnection(visualization.connectionId);
    
    // Prepare query parameters
    const queryParams: queryProcessor.QueryParams = {
      table: visualization.config.table,
      // Ignore pagination for exports
      pageSize: 10000,
      // Apply the visualization's filters
      filters: visualization.config.filters || {}
    };
    
    // If we have a sort column in the config, use it
    if (visualization.config.xField) {
      queryParams.sortColumn = visualization.config.xField;
    }
    
    // Execute the query to get data
    const result = await queryProcessor.executeQuery(db, queryParams);
    
    // Convert to CSV
    return convertToCSV(result.rows);
  } catch (error) {
    console.error(`Error exporting visualization ${visualizationId}:`, error);
    throw new AppError(`Failed to export visualization: ${error instanceof Error ? error.message : String(error)}`, 500);
  }
}

/**
 * Export table data as CSV
 * 
 * @param connectionId Database connection ID
 * @param tableName Table name
 * @param filters Optional filters to apply
 * @returns CSV data
 */
export async function exportTableAsCSV(
  connectionId: number,
  tableName: string,
  filters?: Record<string, unknown>
): Promise<string> {
  try {
    // Get the database connection
    const db = await dbConnector.getConnection(connectionId);
    
    // Prepare query parameters
    const queryParams: queryProcessor.QueryParams = {
      table: tableName,
      // Ignore pagination for exports
      pageSize: 10000,
      filters: filters || {}
    };
    
    // Execute the query to get data
    const result = await queryProcessor.executeQuery(db, queryParams);
    
    // Convert to CSV
    return convertToCSV(result.rows);
  } catch (error) {
    console.error(`Error exporting table ${tableName}:`, error);
    throw new AppError(`Failed to export table: ${error instanceof Error ? error.message : String(error)}`, 500);
  }
}

/**
 * Generate and format filename for exported data
 * 
 * @param baseName Base name for the file
 * @returns Formatted filename with date
 */
export function generateExportFilename(baseName: string): string {
  const date = new Date();
  const formattedDate = date.toISOString().split('T')[0];
  const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
  
  return `${sanitizedBaseName}_${formattedDate}.csv`;
}
