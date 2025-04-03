/**
 * Visualization Builder Page
 * 
 * Page for building and configuring visualizations.
 */

import { useSignal } from "@preact/signals";
import Button from "../components/common/Button.tsx";
import Card from "../components/common/Card.tsx";
import Input from "../components/common/Input.tsx";
import ChartRenderer from "../components/visualization/ChartRenderer.tsx";
import ChartTypeSelector from "../components/visualization/ChartTypeSelector.tsx";
import FieldMapper from "../components/visualization/FieldMapper.tsx";

type ChartType = "bar" | "line" | "pie" | "doughnut";

interface VisualizationBuilderProps {
  connectionId: number;
  tableId: string;
}

export default function VisualizationBuilder({
  connectionId,
  tableId
}: VisualizationBuilderProps) {
  const chartName = useSignal("");
  const chartType = useSignal<ChartType>("bar");
  const fields = useSignal<string[]>([]);
  const xField = useSignal("");
  const yField = useSignal("");
  const groupByField = useSignal<string | undefined>(undefined);
  const chartData = useSignal<any>(null);
  const isLoading = useSignal(false);
  
  // TODO: Implement loading table fields
  // TODO: Implement generating chart data
  
  const handleChartTypeChange = (type: ChartType) => {
    chartType.value = type;
    // TODO: Regenerate chart data
  };
  
  const handleFieldsChange = (fields: { xField: string; yField: string; groupByField?: string }) => {
    xField.value = fields.xField;
    yField.value = fields.yField;
    groupByField.value = fields.groupByField;
    // TODO: Regenerate chart data
  };
  
  const handleSaveVisualization = () => {
    if (!chartName.value.trim()) {
      // TODO: Show validation error
      return;
    }
    
    // TODO: Implement saving visualization
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-900">Visualization Builder</h2>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            onClick={() => {
              // TODO: Navigate back to table viewer
            }}
          >
            Back to Table
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card title="Chart Type">
            <ChartTypeSelector
              selected={chartType.value}
              onChange={handleChartTypeChange}
            />
          </Card>
          
          <Card title="Data Mapping">
            <FieldMapper
              fields={fields.value}
              xField={xField.value}
              yField={yField.value}
              groupByField={groupByField.value}
              onFieldsChange={handleFieldsChange}
            />
          </Card>
          
          <Card title="Save Visualization">
            <div className="space-y-4">
              <Input
                label="Visualization Name"
                value={chartName.value}
                onChange={(e) => chartName.value = e.currentTarget.value}
                placeholder="My Visualization"
              />
              
              <Button
                fullWidth
                onClick={handleSaveVisualization}
                disabled={!chartName.value.trim() || !chartData.value}
              >
                Save Visualization
              </Button>
            </div>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card title="Chart Preview">
            {isLoading.value ? (
              <div className="flex justify-center items-center h-[300px]">
                Loading...
              </div>
            ) : chartData.value ? (
              <ChartRenderer
                config={chartData.value}
                height={400}
              />
            ) : (
              <div className="flex justify-center items-center h-[300px] text-slate-500">
                Select fields to generate chart
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
