/**
 * Template Service
 * 
 * Manages insight templates for data visualization.
 */

import { DB } from "sqlite";
import * as dbUtils from "../utils/dbUtils.ts";
import * as configManager from "./configurationManager.ts";
import * as dbConnector from "./databaseConnector.ts";
import * as queryProcessor from "./queryProcessor.ts";
import { 
  GET_TEMPLATES_SQL, 
  GET_TEMPLATE_SQL, 
  GET_TEMPLATES_BY_CATEGORY_SQL, 
  INSERT_TEMPLATE_SQL 
} from "../models/template.ts";
import { ChartConfig } from "../models/visualization.ts";
import { AppError } from "../middleware/errorHandler.ts";

/**
 * Template field definition
 */
export interface TemplateField {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

/**
 * Extended insight template with field definitions
 */
export interface InsightTemplateWithFields {
  id: number;
  name: string;
  description: string;
  type: string;
  config: Record<string, unknown>;
  category: string;
  isDefault: boolean;
  fields: TemplateField[];
}

/**
 * Parse template configuration and extract field definitions
 * 
 * @param config Template configuration object
 * @returns Array of field definitions
 */
function extractFieldsFromConfig(config: Record<string, unknown>): TemplateField[] {
  const fields: TemplateField[] = [];
  
  try {
    // Check if the config has a fields property
    if (config.fields && Array.isArray(config.fields)) {
      return config.fields as TemplateField[];
    }
    
    // Otherwise, infer from required mappings if any
    if (config.requiredMappings && typeof config.requiredMappings === 'object') {
      const mappings = config.requiredMappings as Record<string, { name: string; description?: string; required: boolean }>;
      
      for (const [id, mapping] of Object.entries(mappings)) {
        fields.push({
          id,
          name: mapping.name,
          description: mapping.description || `Field for ${mapping.name}`,
          required: mapping.required === undefined ? true : mapping.required
        });
      }
      
      return fields;
    }
    
    // Infer from standard x/y axis fields
    fields.push({
      id: 'xField',
      name: 'X-Axis Field',
      description: 'Field to use for the X-axis (categories)',
      required: true
    });
    
    fields.push({
      id: 'yField',
      name: 'Y-Axis Field',
      description: 'Field to use for the Y-axis (values)',
      required: true
    });
    
    if (config.allowGrouping) {
      fields.push({
        id: 'groupBy',
        name: 'Group By Field',
        description: 'Optional field to group data by',
        required: false
      });
    }
    
    return fields;
  } catch (error) {
    console.error("Error extracting fields from template config:", error);
    return fields;
  }
}

/**
 * Get all available templates
 * 
 * @returns Array of templates with field definitions
 */
export async function getTemplates(): Promise<InsightTemplateWithFields[]> {
  const db = configManager.getAppDb();
  
  try {
    const templates = await dbUtils.queryWithTransform<{
      id: number;
      name: string;
      description: string;
      type: string;
      config: string;
      category: string;
      isDefault: boolean;
    }>(db, GET_TEMPLATES_SQL);
    
    return templates.map(template => {
      // Parse the config JSON
      let configObj: Record<string, unknown> = {};
      try {
        configObj = JSON.parse(template.config);
      } catch (e) {
        console.error(`Error parsing template config for template ${template.id}:`, e);
      }
      
      // Extract field definitions
      const fields = extractFieldsFromConfig(configObj);
      
      return {
        id: template.id,
        name: template.name,
        description: template.description,
        type: template.type,
        config: configObj,
        category: template.category,
        isDefault: template.isDefault,
        fields
      };
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    throw new Error(`Failed to fetch templates: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get a template by ID
 * 
 * @param id Template ID
 * @returns Template with field definitions or null if not found
 */
export async function getTemplate(id: number): Promise<InsightTemplateWithFields | null> {
  const db = configManager.getAppDb();
  
  try {
    const template = await dbUtils.querySingleRow<{
      id: number;
      name: string;
      description: string;
      type: string;
      config: string;
      category: string;
      isDefault: boolean;
    }>(db, GET_TEMPLATE_SQL, [id]);
    
    if (!template) {
      return null;
    }
    
    // Parse the config JSON
    let configObj: Record<string, unknown> = {};
    try {
      configObj = JSON.parse(template.config);
    } catch (e) {
      console.error(`Error parsing template config for template ${template.id}:`, e);
    }
    
    // Extract field definitions
    const fields = extractFieldsFromConfig(configObj);
    
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      type: template.type,
      config: configObj,
      category: template.category,
      isDefault: template.isDefault,
      fields
    };
  } catch (error) {
    console.error(`Error fetching template ${id}:`, error);
    throw new Error(`Failed to fetch template: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get templates by category
 * 
 * @param category Category name
 * @returns Array of templates in the category
 */
export async function getTemplatesByCategory(category: string): Promise<InsightTemplateWithFields[]> {
  const db = configManager.getAppDb();
  
  try {
    const templates = await dbUtils.queryWithTransform<{
      id: number;
      name: string;
      description: string;
      type: string;
      config: string;
      category: string;
      isDefault: boolean;
    }>(db, GET_TEMPLATES_BY_CATEGORY_SQL, [category]);
    
    return templates.map(template => {
      // Parse the config JSON
      let configObj: Record<string, unknown> = {};
      try {
        configObj = JSON.parse(template.config);
      } catch (e) {
        console.error(`Error parsing template config for template ${template.id}:`, e);
      }
      
      // Extract field definitions
      const fields = extractFieldsFromConfig(configObj);
      
      return {
        id: template.id,
        name: template.name,
        description: template.description,
        type: template.type,
        config: configObj,
        category: template.category,
        isDefault: template.isDefault,
        fields
      };
    });
  } catch (error) {
    console.error(`Error fetching templates for category '${category}':`, error);
    throw new Error(`Failed to fetch templates by category: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Apply a template to create a chart configuration
 * 
 * @param templateId Template ID
 * @param connectionId Connection ID
 * @param mappings Field mappings
 * @returns Chart configuration
 */
export async function applyTemplate(
  templateId: number,
  connectionId: number,
  mappings: Record<string, string>
): Promise<ChartConfig> {
  try {
    // Get the template
    const template = await getTemplate(templateId);
    
    if (!template) {
      throw new AppError(`Template not found with ID: ${templateId}`, 404);
    }
    
    // Get database connection to verify fields
    const db = await dbConnector.getConnection(connectionId);
    
    // Validate that all required fields are mapped
    const missingRequiredFields = template.fields
      .filter(field => field.required && !mappings[field.id]);
    
    if (missingRequiredFields.length > 0) {
      const missingFields = missingRequiredFields.map(f => f.name).join(', ');
      throw new AppError(`Missing required field mappings: ${missingFields}`, 400);
    }
    
    // Determine the table from the first mapping
    const firstField = Object.values(mappings)[0];
    if (!firstField) {
      throw new AppError("No fields mapped", 400);
    }
    
    // Parse the field to extract table name (format: "tableName.columnName")
    const [tableName, fieldName] = firstField.split('.');
    
    if (!tableName || !fieldName) {
      throw new AppError("Invalid field format. Expected: tableName.columnName", 400);
    }
    
    // Verify table exists
    const tables = await queryProcessor.getTables(db);
    if (!tables.includes(tableName)) {
      throw new AppError(`Table does not exist: ${tableName}`, 400);
    }
    
    // Extract field names from mappings
    const fieldMappings: Record<string, string> = {};
    for (const [templateField, databaseField] of Object.entries(mappings)) {
      const [_, fieldName] = databaseField.split('.');
      if (fieldName) {
        fieldMappings[templateField] = fieldName;
      }
    }
    
    // Create chart configuration
    const chartConfig: ChartConfig = {
      type: template.type as any,
      table: tableName,
      xField: fieldMappings.xField || '',
      yField: fieldMappings.yField || '',
      options: template.config.options as Record<string, unknown>
    };
    
    // Add optional fields if mapped
    if (fieldMappings.groupBy) {
      chartConfig.groupBy = fieldMappings.groupBy;
    }
    
    return chartConfig;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    console.error(`Error applying template ${templateId}:`, error);
    throw new AppError(`Failed to apply template: ${error instanceof Error ? error.message : String(error)}`, 500);
  }
}

/**
 * Create a new template
 * 
 * @param template Template data
 * @returns Created template with ID
 */
export async function createTemplate(template: {
  name: string;
  description: string;
  type: string;
  config: Record<string, unknown>;
  category: string;
  isDefault?: boolean;
}): Promise<InsightTemplateWithFields> {
  const db = configManager.getAppDb();
  
  try {
    // Stringify the config object
    const configJson = JSON.stringify(template.config);
    
    // Insert the template
    db.query(
      INSERT_TEMPLATE_SQL,
      [
        template.name,
        template.description,
        template.type,
        configJson,
        template.category,
        template.isDefault ? 1 : 0
      ]
    );
    
    const id = db.lastInsertRowId;
    
    // Extract field definitions
    const fields = extractFieldsFromConfig(template.config);
    
    return {
      id: Number(id),
      name: template.name,
      description: template.description,
      type: template.type,
      config: template.config,
      category: template.category,
      isDefault: Boolean(template.isDefault),
      fields
    };
  } catch (error) {
    console.error("Error creating template:", error);
    throw new Error(`Failed to create template: ${error instanceof Error ? error.message : String(error)}`);
  }
}
