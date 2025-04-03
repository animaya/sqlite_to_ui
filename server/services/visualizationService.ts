/**
 * Visualization Service
 * 
 * Processes data for chart generation.
 * Manages saved visualization configurations.
 * Handles visualization template processing.
 */

import { DB } from "sqlite";
import * as dbUtils from "../utils/dbUtils.ts";
import * as configManager from "./configurationManager.ts";
import * as dbConnector from "./databaseConnector.ts";
import * as queryProcessor from "./queryProcessor.ts";
import { 
  INSERT_VISUALIZATION_SQL, 
  GET_VISUALIZATIONS_SQL, 
  GET_VISUALIZATION_SQL,
  UPDATE_VISUALIZATION_SQL,
  DELETE_VISUALIZATION_SQL 
} from "../models/visualization.ts";
import { AppError } from "../middleware/errorHandler.ts";

// ChartData interface
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

// Interface for chart configuration
export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  table: string;
  xField: string;
  yField: string;
  groupBy?: string;
  filters?: Record<string, unknown>;
  options?: Record<string, unknown>;
}

// Interface for saved visualization
export interface SavedVisualization {
  id: number;
  connectionId: number;
  name: string;
  type: string;
  config: ChartConfig;
  tableName: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for template
export interface InsightTemplate {
  id: number;
  name: string;
  description: string;
  type: string;
  config: Record<string, unknown>;
  category: string;
  isDefault?: boolean;
}

/**
 * Process data for visualization
 * 
 * @param data Raw data from database
 * @param config Chart configuration
 * @returns Processed data ready for chart rendering
 */
export function processDataForVisualization(
  data: Record<string, unknown>[],
  config: ChartConfig
): ChartData {
  // Standard color palette for charts
  const defaultColorPalette = [
    '#2563EB', // blue-600
    '#D946EF', // fuchsia-500
    '#F59E0B', // amber-500
    '#10B981', // emerald-500
    '#6366F1', // indigo-500
    '#EF4444', // red-500
    '#8B5CF6', // violet-500
    '#EC4899', // pink-500
    '#06B6D4', // cyan-500
    '#84CC16'  // lime-500
  ];

  if (data.length === 0) {
    return {
      labels: [],
      datasets: [{
        label: "No Data",
        data: [],
        backgroundColor: defaultColorPalette,
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1
      }]
    };
  }

  // Extract values for x-axis
  const labels = data.map(item => String(item[config.xField] || "Unknown"));

  // For charts without grouping
  if (!config.groupBy) {
    const values = data.map(item => Number(item[config.yField] || 0));
    
    // For pie/doughnut charts, use the full color palette
    const backgroundColor = (config.type === 'pie' || config.type === 'doughnut')
      ? defaultColorPalette.slice(0, values.length)
      : defaultColorPalette[0];
    
    return {
      labels,
      datasets: [{
        label: config.yField,
        data: values,
        backgroundColor,
        borderColor: config.type === 'line' ? defaultColorPalette[0] : "rgba(255, 255, 255, 0.2)",
        borderWidth: 1
      }]
    };
  }
  
  // For charts with grouping
  // First get all unique group values
  const groups = Array.from(new Set(data.map(item => String(item[config.groupBy!] || "Other"))));
  
  // Create a dataset for each group
  const datasets = groups.map((group, index) => {
    const groupData = data.filter(item => String(item[config.groupBy!]) === group);
    
    // For each group, map the values to the same x-axis labels
    const values = labels.map(label => {
      const matchingItem = groupData.find(item => String(item[config.xField]) === label);
      return matchingItem ? Number(matchingItem[config.yField] || 0) : 0;
    });
    
    return {
      label: group,
      data: values,
      backgroundColor: defaultColorPalette[index % defaultColorPalette.length],
      borderColor: config.type === 'line' ? defaultColorPalette[index % defaultColorPalette.length] : "rgba(255, 255, 255, 0.2)",
      borderWidth: 1
    };
  });
  
  return {
    labels,
    datasets
  };
}

/**
 * Get all visualizations
 * 
 * @returns List of visualizations
 */
export async function getVisualizations(): Promise<SavedVisualization[]> {
  const db = configManager.getAppDb();
  
  try {
    const visualizations = await dbUtils.queryWithTransform<SavedVisualization>(db, GET_VISUALIZATIONS_SQL);
    return visualizations;
  } catch (error) {
    console.error("Error fetching visualizations:", error);
    throw new Error(`Failed to fetch visualizations: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get visualization by ID
 * 
 * @param id Visualization ID
 * @returns Visualization or null if not found
 */
export async function getVisualizationById(id: number): Promise<SavedVisualization | null> {
  const db = configManager.getAppDb();
  
  try {
    return await dbUtils.querySingleRow<SavedVisualization>(db, GET_VISUALIZATION_SQL, [id]);
  } catch (error) {
    console.error(`Error fetching visualization ${id}:`, error);
    throw new Error(`Failed to fetch visualization: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Save a visualization configuration
 * 
 * @param visualization Visualization to save
 * @returns Saved visualization with ID
 */
export async function saveVisualization(
  visualization: Omit<SavedVisualization, 'id' | 'createdAt' | 'updatedAt'>
): Promise<SavedVisualization> {
  const db = configManager.getAppDb();
  
  try {
    // Convert config to JSON string
    const configJson = JSON.stringify(visualization.config);
    
    // Insert the visualization
    db.query(
      INSERT_VISUALIZATION_SQL,
      [
        visualization.connectionId,
        visualization.name,
        visualization.type,
        configJson,
        visualization.tableName
      ]
    );
    
    const id = db.lastInsertRowId;
    
    return {
      id: Number(id),
      connectionId: visualization.connectionId,
      name: visualization.name,
      type: visualization.type,
      config: visualization.config,
      tableName: visualization.tableName,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error("Error saving visualization:", error);
    throw new Error(`Failed to save visualization: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Update a visualization
 * 
 * @param id Visualization ID
 * @param name New name
 * @param type New type
 * @param config New config
 * @param tableName New table name
 * @returns Updated visualization
 */
export async function updateVisualization(
  id: number,
  name: string,
  type: string,
  config: ChartConfig,
  tableName: string
): Promise<SavedVisualization> {
  const db = configManager.getAppDb();
  
  try {
    // Convert config to JSON string
    const configJson = JSON.stringify(config);
    
    // Update the visualization
    db.query(
      UPDATE_VISUALIZATION_SQL,
      [name, type, configJson, tableName, id]
    );
    
    // Get the updated visualization
    const updatedVisualization = await getVisualizationById(id);
    
    if (!updatedVisualization) {
      throw new Error(`Visualization not found after update: ${id}`);
    }
    
    return updatedVisualization;
  } catch (error) {
    console.error(`Error updating visualization ${id}:`, error);
    throw new Error(`Failed to update visualization: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Delete a visualization
 * 
 * @param id Visualization ID
 * @returns True if successful
 */
export async function deleteVisualization(id: number): Promise<boolean> {
  const db = configManager.getAppDb();
  
  try {
    // Delete the visualization
    db.query(DELETE_VISUALIZATION_SQL, [id]);
    return true;
  } catch (error) {
    console.error(`Error deleting visualization ${id}:`, error);
    throw new Error(`Failed to delete visualization: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Create a chart preview using data from a database
 * 
 * @param connectionId Connection ID
 * @param config Chart configuration
 * @returns Chart data
 */
export async function createChartPreview(
  connectionId: number,
  config: ChartConfig
): Promise<{ type: string; data: ChartData; options?: Record<string, unknown> }> {
  try {
    // Get database connection
    const db = await dbConnector.getConnection(connectionId);
    
    // Prepare query parameters
    const queryParams: queryProcessor.QueryParams = {
      table: config.table,
      filters: config.filters,
      // Limit to 100 records for preview
      pageSize: 100
    };
    
    // Execute query to get data
    const queryResult = await queryProcessor.executeQuery(db, queryParams);
    
    // Process the data for visualization
    const chartData = processDataForVisualization(queryResult.rows, config);
    
    return {
      type: config.type,
      data: chartData,
      options: config.options
    };
  } catch (error) {
    console.error("Error creating chart preview:", error);
    throw new Error(`Failed to create chart preview: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get available insight templates
 * 
 * @param category Optional category filter
 * @returns List of templates
 */
export async function getInsightTemplates(category?: string): Promise<InsightTemplate[]> {
  const db = configManager.getAppDb();
  
  try {
    let sql = `
      SELECT 
        id,
        name,
        description,
        type,
        config,
        category,
        is_default as isDefault
      FROM insight_templates
    `;
    
    const params: unknown[] = [];
    
    if (category) {
      sql += ` WHERE category = ?`;
      params.push(category);
    }
    
    sql += ` ORDER BY name`;
    
    const templates = db.query<{
      id: number;
      name: string;
      description: string;
      type: string;
      config: string;
      category: string;
      isDefault: number;
    }>(sql, params);
    
    return templates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      type: template.type,
      config: JSON.parse(template.config),
      category: template.category,
      isDefault: Boolean(template.isDefault)
    }));
  } catch (error) {
    console.error("Error fetching templates:", error);
    throw new Error(`Failed to fetch templates: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Apply an insight template to data
 * 
 * @param templateId Template ID
 * @param connectionId Connection ID
 * @param mappings Field mappings
 * @returns Processed visualization config
 */
export async function applyTemplate(
  templateId: number,
  connectionId: number,
  mappings: Record<string, string>
): Promise<ChartConfig> {
  const db = configManager.getAppDb();
  
  try {
    // Get the template
    const templateResult = db.query<{
      id: number;
      name: string;
      description: string;
      type: string;
      config: string;
      category: string;
    }>(
      `SELECT id, name, description, type, config, category FROM insight_templates WHERE id = ?`,
      [templateId]
    );
    
    if (templateResult.length === 0) {
      throw new AppError(`Template not found with ID: ${templateId}`, 404);
    }
    
    const template = templateResult[0];
    const templateConfig = JSON.parse(template.config);
    
    // Parse the field mappings to extract table name
    const firstMappingEntry = Object.entries(mappings)[0];
    if (!firstMappingEntry) {
      throw new AppError("No field mappings provided", 400);
    }
    
    const firstMapping = firstMappingEntry[1];
    const [tableName, _] = firstMapping.split('.');
    
    if (!tableName) {
      throw new AppError("Invalid field mapping format", 400);
    }
    
    // Create visualization config
    const chartConfig: ChartConfig = {
      type: template.type as 'bar' | 'line' | 'pie' | 'doughnut',
      table: tableName,
      xField: '',
      yField: '',
      options: templateConfig.options
    };
    
    // Apply mappings
    for (const [key, value] of Object.entries(mappings)) {
      const [_, fieldName] = value.split('.');
      
      if (fieldName) {
        if (key === 'xField') {
          chartConfig.xField = fieldName;
        } else if (key === 'yField') {
          chartConfig.yField = fieldName;
        } else if (key === 'groupBy') {
          chartConfig.groupBy = fieldName;
        }
      }
    }
    
    // Validate that required fields are present
    if (!chartConfig.xField || !chartConfig.yField) {
      throw new AppError("Missing required field mappings for x-axis or y-axis", 400);
    }
    
    return chartConfig;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error(`Error applying template ${templateId}:`, error);
    throw new Error(`Failed to apply template: ${error instanceof Error ? error.message : String(error)}`);
  }
}
