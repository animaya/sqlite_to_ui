/**
 * Saved Visualizations Page
 * 
 * Page for viewing and managing saved visualizations.
 */

import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import Button from "../components/common/Button.tsx";
import Card from "../components/common/Card.tsx";
import ChartRenderer from "../components/visualization/ChartRenderer.tsx";
import * as visualizationService from "../services/visualizationService.ts";

interface SavedVisualizationsProps {
  onNavigate: (page: string, params?: Record<string, unknown>) => void;
}

export default function SavedVisualizations({ onNavigate }: SavedVisualizationsProps) {
  const visualizations = useSignal<visualizationService.SavedVisualization[]>([]);
  const isLoading = useSignal(false);
  const error = useSignal<string | null>(null);
  
  // Load visualizations when the component mounts
  useEffect(() => {
    loadVisualizations();
  }, []);
  
  // Function to load visualizations from the API
  const loadVisualizations = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const data = await visualizationService.getVisualizations();
      visualizations.value = data;
    } catch (err) {
      console.error("Error loading visualizations:", err);
      error.value = err instanceof Error ? err.message : "Failed to load visualizations";
    } finally {
      isLoading.value = false;
    }
  };
  
  // Handle deletion of a visualization
  const handleDeleteVisualization = async (id: number) => {
    if (!confirm("Are you sure you want to delete this visualization?")) {
      return;
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      await visualizationService.deleteVisualization(id);
      
      // Reload visualizations
      await loadVisualizations();
    } catch (err) {
      console.error("Error deleting visualization:", err);
      error.value = err instanceof Error ? err.message : "Failed to delete visualization";
    } finally {
      isLoading.value = false;
    }
  };
  
  // Handle editing a visualization
  const handleEditVisualization = (id: number) => {
    const visualization = visualizations.value.find(v => v.id === id);
    
    if (visualization) {
      onNavigate('visualizationBuilder', {
        connectionId: visualization.connectionId,
        tableName: visualization.tableName,
        chartConfig: visualization.config,
        visualizationId: visualization.id
      });
    }
  };
  
  // Handle CSV export
  const handleExportCSV = (id: number) => {
    const exportUrl = visualizationService.getVisualizationExportUrl(id);
    window.open(exportUrl, '_blank');
  };
  
  if (isLoading.value) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-slate-900">Saved Visualizations</h2>
          <Button variant="secondary" onClick={() => onNavigate('connections')}>
            Back to Connections
          </Button>
        </div>
        
        <Card>
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center">
              <svg className="animate-spin h-6 w-6 mr-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-slate-600">Loading visualizations...</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }
  
  if (visualizations.value.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-slate-900">Saved Visualizations</h2>
          <Button variant="secondary" onClick={() => onNavigate('connections')}>
            Back to Connections
          </Button>
        </div>
        
        <Card>
          <div className="text-center py-12 text-slate-500">
            <p className="mb-4">No saved visualizations found.</p>
            <Button
              onClick={() => onNavigate('connections')}
            >
              Start Creating Visualizations
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-900">Saved Visualizations</h2>
        <Button variant="secondary" onClick={() => onNavigate('connections')}>
          Back to Connections
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visualizations.value.map((viz) => (
          <Card
            key={viz.id}
            title={viz.name}
            actions={
              <>
                <Button
                  variant="tertiary"
                  onClick={() => handleExportCSV(viz.id)}
                >
                  Export
                </Button>
                <Button
                  variant="tertiary"
                  onClick={() => handleEditVisualization(viz.id)}
                >
                  Edit
                </Button>
                <Button
                  variant="tertiary"
                  onClick={() => handleDeleteVisualization(viz.id)}
                >
                  Delete
                </Button>
              </>
            }
          >
            <div>
              <div className="mb-2">
                <ChartRenderer config={viz.config} height={200} />
              </div>
              <div className="text-xs text-slate-500">
                <p>Table: {viz.tableName}</p>
                <p>Created: {new Date(viz.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
