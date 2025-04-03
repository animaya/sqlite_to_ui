/**
 * Visualization Service
 * 
 * Service for creating and managing visualizations.
 */

import * as api from "./api.ts";

export type ChartType = "bar" | "line" | "pie" | "doughnut";

export interface ChartConfig {
  type: ChartType;
  table: string;
  xField: string;
  yField: string;
  groupBy?: string;
  filters?: Record<string, unknown>;
  options?: Record<string, unknown>;
}

export interface SavedVisualization {
  id: number;
  connectionId: number;
  name: string;
  type: string;
  config: ChartConfig;
  tableName: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create a chart configuration
 * 
 * @param connectionId Connection ID
 * @param config Chart configuration
 * @returns Chart data
 */
export async function createChartConfig(
  connectionId: number,
  config: ChartConfig
): Promise<any> {
  return api.post<any>("/visualizations/preview", {
    connectionId,
    config
  });
}

/**
 * Get all saved visualizations
 * 
 * @returns List of saved visualizations
 */
export async function getVisualizations(): Promise<SavedVisualization[]> {
  return api.get<SavedVisualization[]>("/visualizations");
}

/**
 * Get a visualization by ID
 * 
 * @param id Visualization ID
 * @returns Visualization details
 */
export async function getVisualization(id: number): Promise<SavedVisualization> {
  return api.get<SavedVisualization>(`/visualizations/${id}`);
}

/**
 * Save a visualization
 * 
 * @param connectionId Connection ID
 * @param name Visualization name
 * @param config Chart configuration
 * @returns Saved visualization
 */
export async function saveVisualization(
  connectionId: number,
  name: string,
  config: ChartConfig
): Promise<SavedVisualization> {
  return api.post<SavedVisualization>("/visualizations", {
    connectionId,
    name,
    type: config.type,
    config,
    tableName: config.table
  });
}

/**
 * Update a visualization
 * 
 * @param id Visualization ID
 * @param name Visualization name
 * @param config Chart configuration
 * @returns Updated visualization
 */
export async function updateVisualization(
  id: number,
  name: string,
  config: ChartConfig
): Promise<SavedVisualization> {
  return api.put<SavedVisualization>(`/visualizations/${id}`, {
    name,
    type: config.type,
    config,
    tableName: config.table
  });
}

/**
 * Delete a visualization
 * 
 * @param id Visualization ID
 * @returns Success result
 */
export async function deleteVisualization(id: number): Promise<{ success: boolean }> {
  return api.del<{ success: boolean }>(`/visualizations/${id}`);
}

/**
 * Get the export URL for a visualization
 * 
 * @param id Visualization ID
 * @returns CSV export URL
 */
export function getVisualizationExportUrl(id: number): string {
  return `/api/export/csv/${id}`;
}
