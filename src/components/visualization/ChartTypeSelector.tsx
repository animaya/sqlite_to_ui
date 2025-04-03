/**
 * Chart Type Selector Component
 * 
 * Allows users to select a chart type for visualization.
 */

type ChartType = "bar" | "line" | "pie" | "doughnut";

interface ChartTypeSelectorProps {
  selected: ChartType;
  onChange: (type: ChartType) => void;
}

export default function ChartTypeSelector({
  selected,
  onChange
}: ChartTypeSelectorProps) {
  const chartTypes: { value: ChartType; label: string; icon: string }[] = [
    { value: "bar", label: "Bar Chart", icon: "📊" },
    { value: "line", label: "Line Chart", icon: "📈" },
    { value: "pie", label: "Pie Chart", icon: "🥧" },
    { value: "doughnut", label: "Doughnut Chart", icon: "🍩" }
  ];
  
  return (
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
        >
          <span className="mr-2">{type.icon}</span>
          <span>{type.label}</span>
        </div>
      ))}
    </div>
  );
}
