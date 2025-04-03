/**
 * Visualization Service
 * 
 * Processes data for chart generation.
 * Manages saved visualization configurations.
 * Handles visualization template processing.
 */

// Interface for chart configuration
interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  table: string;
  xField: string;
  yField: string;
  groupBy?: string;
  filters?: Record<string, unknown>;
  options?: Record<string, unknown>;
}

// Interface for saved visualization
interface SavedVisualization {
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
interface InsightTemplate {
  id: number;
  name: string;
  description: string;
  type: string;
  config: Record<string, unknown>;
  category: string;
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
): Record<string, unknown> {
  // TODO: Implement data processing for visualization
  return {
    labels: [],
    datasets: []
  };
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
    const result = db.query(
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
      category: template.category
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
      throw new Error(`Template not found with ID: ${templateId}`);
    }
    
    const template = templateResult[0];
    const templateConfig = JSON.parse(template.config);
    
    // Parse the field mappings to extract table name
    const firstMapping = Object.values(mappings)[0];
    if (!firstMapping) {
      throw new Error("No field mappings provided");
    }
    
    const [tableName, _] = firstMapping.split('.');
    
    if (!tableName) {
      throw new Error("Invalid field mapping format");
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
      
      if (key === 'xField') {
        chartConfig.xField = fieldName;
      } else if (key === 'yField') {
        chartConfig.yField = fieldName;
      } else if (key === 'groupBy') {
        chartConfig.groupBy = fieldName;
      }
    }
    
    return chartConfig;
  } catch (error) {
    console.error(`Error applying template ${templateId}:`, error);
    throw new Error(`Failed to apply template: ${error instanceof Error ? error.message : String(error)}`);
  }
}
  visualization: Omit<SavedVisualization, 'id' | 'createdAt' | 'updatedAt'>
): Promise<SavedVisualization> {
  // TODO: Implement saving visualization to app database
  return {
    id: 0,
    connectionId: visualization.connectionId,
    name: visualization.name,
    type: visualization.type,
    config: visualization.config,
    tableName: visualization.tableName,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Get available insight templates
 * 
 * @param category Optional category filter
 * @returns List of templates
 */
export async function getInsightTemplates(category?: string): Promise<InsightTemplate[]> {
  // TODO: Implement fetching templates from app database
  return [];
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
  // TODO: Implement template application
  return {
    type: 'bar',
    table: '',
    xField: '',
    yField: ''
  };
}
