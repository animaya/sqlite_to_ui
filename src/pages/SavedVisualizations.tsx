/**
 * Saved Visualizations Page
 * 
 * Page for viewing and managing saved visualizations.
 */

import { useSignal } from "@preact/signals";
import Button from "../components/common/Button.tsx";
import Card from "../components/common/Card.tsx";
import ChartRenderer from "../components/visualization/ChartRenderer.tsx";

interface SavedVisualization {
  id: number;
  name: string;
  type: string;
  config: any;
  tableName: string;
  createdAt: string;
  connectionId: number;
}

export default function SavedVisualizations() {
  const visualizations = useSignal<SavedVisualization[]>([]);
  
  // TODO: Implement loading saved visualizations
  
  const handleDeleteVisualization = (id: number) => {
    // TODO: Implement deleting visualization
  };
  
  const handleEditVisualization = (id: number) => {
    // TODO: Navigate to visualization editor
  };
  
  const handleExportCSV = (id: number) => {
    // TODO: Implement CSV export
  };
  
  if (visualizations.value.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-slate-900">Saved Visualizations</h2>
        </div>
        
        <Card>
          <div className="text-center py-12 text-slate-500">
            <p className="mb-4">No saved visualizations found.</p>
            <Button
              onClick={() => {
                // TODO: Navigate to connections page
              }}
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
      </div>
      
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
