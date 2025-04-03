/**
 * Chart Renderer Component
 * 
 * Renders charts based on the provided configuration using Chart.js.
 * Handles chart initialization, updates, and cleanup.
 */

import { useEffect, useRef } from "preact/hooks";
import { Chart, registerables } from "chart.js";

// Register all Chart.js components
Chart.register(...registerables);

// Chart type definition
type ChartType = "bar" | "line" | "pie" | "doughnut";

// Chart configuration interface
interface ChartConfig {
  type: ChartType;
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
    }>;
  };
  options?: Record<string, unknown>;
}

interface ChartRendererProps {
  config: ChartConfig;
  height?: number;
  width?: number;
}

// Default chart options based on the chart types
const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 12,
        padding: 15,
        font: {
          family: "'Inter', sans-serif",
        }
      }
    },
    tooltip: {
      backgroundColor: '#0F172A', // slate-900
      titleColor: '#FFFFFF',
      bodyColor: '#FFFFFF',
      padding: 12,
      cornerRadius: 4,
      titleFont: {
        weight: 'medium',
        family: "'Inter', sans-serif",
      },
      bodyFont: {
        family: "'Inter', sans-serif",
      }
    }
  }
};

// Color palette for charts
const chartColors = [
  '#2563EB', // blue-600
  '#D946EF', // fuchsia-500
  '#F59E0B', // amber-500
  '#10B981', // emerald-500
  '#6366F1', // indigo-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
];

export default function ChartRenderer({
  config,
  height = 300,
  width = 600
}: ChartRendererProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    // Apply colors to datasets if not specified
    const enhancedConfig = enhanceChartConfig(config);
    
    // Initialize chart
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: enhancedConfig.type,
      data: enhancedConfig.data,
      options: {
        ...defaultOptions,
        ...enhancedConfig.options
      }
    });
    
    return () => {
      // Clean up chart instance on unmount
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [config]);
  
  /**
   * Enhance chart configuration with default settings and colors
   */
  const enhanceChartConfig = (config: ChartConfig): ChartConfig => {
    const enhancedConfig = { ...config };
    
    // Apply chart-specific styling
    enhancedConfig.data = { ...config.data };
    enhancedConfig.data.datasets = config.data.datasets.map((dataset, index) => {
      const colorIndex = index % chartColors.length;
      const color = chartColors[colorIndex];
      
      // Different defaults based on chart type
      if (config.type === 'line') {
        return {
          ...dataset,
          borderColor: dataset.borderColor || color,
          backgroundColor: dataset.backgroundColor || 'rgba(255, 255, 255, 0.1)',
          borderWidth: dataset.borderWidth || 2,
          tension: 0.2,
          pointRadius: 3,
          pointHoverRadius: 5
        };
      } else if (config.type === 'bar') {
        return {
          ...dataset,
          backgroundColor: dataset.backgroundColor || color,
          borderColor: dataset.borderColor || 'rgba(255, 255, 255, 0.1)',
          borderWidth: dataset.borderWidth || 0,
          borderRadius: 4,
          maxBarThickness: 40
        };
      } else if (config.type === 'pie' || config.type === 'doughnut') {
        // For pie/doughnut, use all colors for a single dataset
        const backgroundColors = dataset.backgroundColor || 
          (dataset.data.length <= chartColors.length 
            ? chartColors.slice(0, dataset.data.length)
            : dataset.data.map((_, i) => chartColors[i % chartColors.length]));
            
        return {
          ...dataset,
          backgroundColor: backgroundColors,
          borderColor: dataset.borderColor || '#FFFFFF',
          borderWidth: dataset.borderWidth || 2
        };
      }
      
      // Default fallback
      return {
        ...dataset,
        backgroundColor: dataset.backgroundColor || color,
        borderColor: dataset.borderColor || color
      };
    });
    
    return enhancedConfig;
  };
  
  // Render chart container with canvas
  return (
    <div className="chart-container" style={{ height: `${height}px`, width: "100%" }}>
      <canvas ref={chartRef} />
    </div>
  );
}
