/**
 * Template Service
 * 
 * Service for working with insight templates.
 */

import * as api from "./api.ts";
import { ChartConfig } from "./visualizationService.ts";

export interface TemplateField {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

export interface InsightTemplate {
  id: number;
  name: string;
  description: string;
  type: string;
  config: Record<string, unknown>;
  category: string;
  fields: TemplateField[];
}

/**
 * Get all available templates
 * 
 * @returns List of templates
 */
export async function getTemplates(): Promise<InsightTemplate[]> {
  return api.get<InsightTemplate[]>("/templates");
}

/**
 * Get a template by ID
 * 
 * @param id Template ID
 * @returns Template details
 */
export async function getTemplate(id: number): Promise<InsightTemplate> {
  return api.get<InsightTemplate>(`/templates/${id}`);
}

/**
 * Apply a template to data
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
  return api.post<ChartConfig>(`/templates/${templateId}/apply`, {
    connectionId,
    mappings
  });
}
