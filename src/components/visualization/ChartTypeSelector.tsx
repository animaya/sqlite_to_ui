/**
 * Chart Type Selector Component
 * 
 * Allows users to select a chart type for visualization.
 * Provides visual distinction for the selected chart type.
 */

// Chart type definition
type ChartType = "bar" | "line" | "pie" | "doughnut";

// Component props
interface ChartTypeSelectorProps {
  selected: ChartType;
  onChange: (type: ChartType) => void;
}

export default function ChartTypeSelector({
  selected,
  onChange
}: ChartTypeSelectorProps) {
  // Chart types with labels and icons
  const chartTypes: { value: ChartType; label: string; icon: string; description: string }[] = [
    { 
      value: "bar", 
      label: "Bar Chart", 
      icon: "📊",
      description: "Compare values across categories" 
    },
    { 
      value: "line", 
      label: "Line Chart", 
      icon: "📈",
      description: "Show trends over time or continuous data" 
    },
    { 
      value: "pie", 
      label: "Pie Chart", 
      icon: "🥧",
      description: "Show proportion of parts to a whole" 
    },
    { 
      value: "doughnut", 
      label: "Doughnut Chart", 
      icon: "🍩",
      description: "Like pie chart with space in center" 
    }
  ];
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {chartTypes.map((type) => (
          <div
            key={type.value}
            className={`
              flex items-center px-3 py-2 border rounded-md cursor-pointer transition-colors
              ${selected === type.value
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }
            `}
            onClick={() => onChange(type.value)}
            title={type.description}
          >
            <span className="mr-2">{type.icon}</span>
            <span>{type.label}</span>
          </div>
        ))}
      </div>
      
      {/* Description of selected chart type */}
      <div className="text-xs text-slate-500">
        {chartTypes.find(type => type.value === selected)?.description}
      </div>
    </div>
  );
}
