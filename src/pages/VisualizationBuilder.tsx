/**
 * Visualization Builder Page
 * 
 * Page for building and configuring visualizations.
 */

import { useSignal, useComputed } from "@preact/signals";
import { useEffect } from "preact/hooks";
import Button from "../components/common/Button.tsx";
import Card from "../components/common/Card.tsx";
import Input from "../components/common/Input.tsx";
import ChartRenderer from "../components/visualization/ChartRenderer.tsx";
import ChartTypeSelector from "../components/visualization/ChartTypeSelector.tsx";
import FieldMapper from "../components/visualization/FieldMapper.tsx";
import * as tableService from "../services/tableService.ts";
import * as visualizationService from "../services/visualizationService.ts";

type ChartType = "bar" | "line" | "pie" | "doughnut";

interface VisualizationBuilderProps {
  connectionId: number;
  tableId: string;
  chartConfig?: any;
  visualizationId?: number;
  onNavigate: (page: string, params?: Record<string, unknown>) => void;
}

export default function VisualizationBuilder({
  connectionId,
  tableId,
  chartConfig,
  visualizationId,
  onNavigate
}: VisualizationBuilderProps) {
  // Form state
  const chartName = useSignal(chartConfig?.name || "");
  const chartType = useSignal<ChartType>(chartConfig?.type || "bar");
  const tableSchema = useSignal<tableService.TableSchema[]>([]);
  const xField = useSignal(chartConfig?.config?.xField || "");
  const yField = useSignal(chartConfig?.config?.yField || "");
  const groupByField = useSignal<string | undefined>(chartConfig?.config?.groupBy);
  
  // UI state
  const chartData = useSignal<any>(null);
  const isLoading = useSignal(false);
  const isSaving = useSignal(false);
  const error = useSignal<string | null>(null);
  const successMessage = useSignal<string | null>(null);
  
  // Computed field names from schema
  const fieldNames = useComputed(() => {
    return tableSchema.value.map(field => field.name);
  });
  
  // Load table schema when component mounts
  useEffect(() => {
    loadTableSchema();
  }, [connectionId, tableId]);
  
  // Generate chart data when form values change
  useEffect(() => {
    if (xField.value && yField.value) {
      generateChartData();
    }
  }, [xField.value, yField.value, groupByField.value, chartType.value]);
  
  // Load table schema from API
  const loadTableSchema = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const schema = await tableService.getTableSchema(connectionId, tableId);
      tableSchema.value = schema;
      
      // Auto-select fields if none are selected
      if (schema.length > 0 && !xField.value) {
        xField.value = schema[0].name;
      }
      
      if (schema.length > 1 && !yField.value) {
        // Try to find a numeric field for y-axis
        const numericField = schema.find(field => 
          field.type.toLowerCase().includes('int') || 
          field.type.toLowerCase().includes('real') ||
          field.type.toLowerCase().includes('float') ||
          field.type.toLowerCase().includes('double') ||
          field.type.toLowerCase().includes('decimal')
        );
        
        yField.value = numericField ? numericField.name : schema[1].name;
      }
    } catch (err) {
      console.error("Error loading table schema:", err);
      error.value = err instanceof Error ? err.message : "Failed to load table schema";
    } finally {
      isLoading.value = false;
    }
  };
  
  // Generate chart preview data
  const generateChartData = async () => {
    if (!xField.value || !yField.value) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      // Build chart configuration
      const config = {
        type: chartType.value,
        table: tableId,
        xField: xField.value,
        yField: yField.value
      };
      
      if (groupByField.value) {
        // @ts-ignore - TypeScript doesn't know we're extending the object
        config.groupBy = groupByField.value;
      }
      
      // Get chart data
      const data = await visualizationService.createChartConfig(connectionId, config);
      chartData.value = data;
    } catch (err) {
      console.error("Error generating chart data:", err);
      error.value = err instanceof Error ? err.message : "Failed to generate chart";
    } finally {
      isLoading.value = false;
    }
  };
  
  // Handle chart type change
  const handleChartTypeChange = (type: ChartType) => {
    chartType.value = type;
  };
  
  // Handle field selection changes
  const handleFieldsChange = (fields: { xField: string; yField: string; groupByField?: string }) => {
    xField.value = fields.xField;
    yField.value = fields.yField;
    groupByField.value = fields.groupByField;
  };
  
  // Save visualization
  const handleSaveVisualization = async () => {
    if (!chartName.value.trim()) {
      error.value = "Visualization name is required";
      return;
    }
    
    if (!chartData.value) {
      error.value = "Chart data is required";
      return;
    }
    
    isSaving.value = true;
    error.value = null;
    successMessage.value = null;
    
    try {
      const config = {
        type: chartType.value,
        table: tableId,
        xField: xField.value,
        yField: yField.value,
        ...(groupByField.value ? { groupBy: groupByField.value } : {})
      };
      
      if (visualizationId) {
        // Update existing visualization
        await visualizationService.updateVisualization(
          visualizationId,
          chartName.value,
          config
        );
        
        successMessage.value = "Visualization updated successfully";
      } else {
        // Save new visualization
        await visualizationService.saveVisualization(
          connectionId,
          chartName.value,
          config
        );
        
        successMessage.value = "Visualization saved successfully";
      }
      
      // Clear form after successful save
      if (!visualizationId) {
        chartName.value = "";
      }
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        successMessage.value = null;
      }, 3000);
    } catch (err) {
      console.error("Error saving visualization:", err);
      error.value = err instanceof Error ? err.message : "Failed to save visualization";
    } finally {
      isSaving.value = false;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-900">
          {visualizationId ? "Edit Visualization" : "Visualization Builder"}
        </h2>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            onClick={() => {
              onNavigate('tableViewer', { connectionId, tableName: tableId });
            }}
          >
            Back to Table
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              onNavigate('savedVisualizations');
            }}
          >
            Saved Visualizations
          </Button>
        </div>
      </div>
      
      {error.value && (
        <div className="p-4 rounded-md bg-red-50 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0 text-red-400">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error.value}</p>
            </div>
          </div>
        </div>
      )}
      
      {successMessage.value && (
        <div className="p-4 rounded-md bg-green-50 border border-green-200">
          <div className="flex">
            <div className="flex-shrink-0 text-green-400">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage.value}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card title="Chart Type">
            <ChartTypeSelector
              selected={chartType.value}
              onChange={handleChartTypeChange}
            />
          </Card>
          
          <Card title="Data Mapping">
            {isLoading.value && !tableSchema.value.length ? (
              <div className="flex justify-center items-center py-4">
                <div className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-slate-600">Loading fields...</span>
                </div>
              </div>
            ) : (
              <FieldMapper
                fields={fieldNames.value}
                xField={xField.value}
                yField={yField.value}
                groupByField={groupByField.value}
                onFieldsChange={handleFieldsChange}
              />
            )}
          </Card>
          
          <Card title="Save Visualization">
            <div className="space-y-4">
              <Input
                label="Visualization Name"
                value={chartName.value}
                onChange={(e) => chartName.value = e.currentTarget.value}
                placeholder="My Visualization"
                error={!chartName.value.trim() && error.value?.includes("name") ? "Name is required" : undefined}
              />
              
              <Button
                fullWidth
                onClick={handleSaveVisualization}
                disabled={!chartName.value.trim() || !chartData.value || isSaving.value}
                isLoading={isSaving.value}
              >
                {visualizationId ? "Update Visualization" : "Save Visualization"}
              </Button>
            </div>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card title="Chart Preview">
            {isLoading.value ? (
              <div className="flex justify-center items-center h-[300px]">
                <div className="flex items-center">
                  <svg className="animate-spin h-6 w-6 mr-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-slate-600">Generating chart...</span>
                </div>
              </div>
            ) : chartData.value ? (
              <ChartRenderer
                config={chartData.value}
                height={400}
              />
            ) : (
              <div className="flex justify-center items-center h-[300px] text-slate-500">
                <div className="text-center">
                  <p className="mb-2">Select fields to generate chart</p>
                  <p className="text-xs text-slate-400">
                    Select an X-axis field (categories) and Y-axis field (values)
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
