/**
 * Templates Page
 * 
 * Page for browsing and applying insight templates.
 */

import { useSignal, useComputed } from "@preact/signals";
import { useEffect } from "preact/hooks";
import Button from "../components/common/Button.tsx";
import Card from "../components/common/Card.tsx";
import TemplateConfigurator from "../components/templates/TemplateConfigurator.tsx";
import TemplateList from "../components/templates/TemplateList.tsx";
import * as templateService from "../services/templateService.ts";
import * as tableService from "../services/tableService.ts";
import * as visualizationService from "../services/visualizationService.ts";

interface TemplatesPageProps {
  connectionId: number;
  tableName: string;
  onNavigate: (page: string, params?: Record<string, unknown>) => void;
}

export default function TemplatesPage({
  connectionId,
  tableName,
  onNavigate
}: TemplatesPageProps) {
  const templates = useSignal<templateService.InsightTemplate[]>([]);
  const tableFields = useSignal<{ name: string; type: string }[]>([]);
  const selectedTemplate = useSignal<templateService.InsightTemplate | null>(null);
  const isLoading = useSignal(false);
  const error = useSignal<string | null>(null);
  
  // Compute field options for template configurator
  const tableFieldOptions = useComputed(() => {
    return tableFields.value.map(field => ({
      value: `${tableName}.${field.name}`,
      label: field.name
    }));
  });
  
  // Fetch templates and table fields when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      isLoading.value = true;
      error.value = null;
      
      try {
        // Fetch templates
        const templatesData = await templateService.getTemplates();
        templates.value = templatesData;
        
        // Fetch table schema
        const schema = await tableService.getTableSchema(connectionId, tableName);
        tableFields.value = schema;
      } catch (err) {
        console.error("Error fetching data:", err);
        error.value = err instanceof Error ? err.message : "An error occurred";
      } finally {
        isLoading.value = false;
      }
    };
    
    fetchData();
  }, [connectionId, tableName]);
  
  const handleSelectTemplate = (id: number) => {
    const template = templates.value.find(t => t.id === id);
    if (template) {
      selectedTemplate.value = template;
    }
  };
  
  const handleApplyTemplate = async (mappings: Record<string, string>) => {
    if (!selectedTemplate.value) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      // Apply template to get chart configuration
      const chartConfig = await templateService.applyTemplate(
        selectedTemplate.value.id,
        connectionId,
        mappings
      );
      
      // Navigate to visualization builder with the chart config
      onNavigate('visualizationBuilder', { 
        connectionId, 
        tableName,
        chartConfig 
      });
    } catch (err) {
      console.error("Error applying template:", err);
      error.value = err instanceof Error ? err.message : "An error occurred";
    } finally {
      isLoading.value = false;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-900">Insight Templates</h2>
        <Button
          variant="secondary"
          onClick={() => {
            onNavigate('tableViewer', { connectionId, tableName });
          }}
        >
          Back to Table
        </Button>
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
      
      {isLoading.value ? (
        <Card>
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center">
              <svg className="animate-spin h-6 w-6 mr-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-slate-600">Loading...</span>
            </div>
          </div>
        </Card>
      ) : selectedTemplate.value ? (
        <Card>
          <TemplateConfigurator
            templateName={selectedTemplate.value.name}
            templateFields={selectedTemplate.value.fields}
            tableFields={tableFieldOptions.value}
            onApply={handleApplyTemplate}
            onCancel={() => {
              selectedTemplate.value = null;
            }}
          />
        </Card>
      ) : templates.value.length > 0 ? (
        <Card>
          <TemplateList
            templates={templates.value}
            onSelect={handleSelectTemplate}
          />
        </Card>
      ) : (
        <Card>
          <div className="text-center py-6 text-slate-500">
            No templates found. Templates help you quickly create visualizations with pre-defined configurations.
          </div>
        </Card>
      )}
    </div>
  );
}
