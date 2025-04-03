/**
 * Field Mapper Component
 * 
 * Allows users to map database fields to chart axes.
 * Provides intuitive UI for selecting X-axis, Y-axis, and optional grouping fields.
 */

import { useSignal } from "@preact/signals";
import Select from "../common/Select.tsx";

interface FieldMapperProps {
  fields: string[];
  xField: string;
  yField: string;
  groupByField?: string;
  onFieldsChange: (fields: { xField: string; yField: string; groupByField?: string }) => void;
}

export default function FieldMapper({
  fields,
  xField,
  yField,
  groupByField,
  onFieldsChange
}: FieldMapperProps) {
  // Create field options for select dropdowns
  const fieldOptions = fields.map(field => ({
    value: field,
    label: field
  }));
  
  // Handle field change events
  const handleXFieldChange = (value: string) => {
    onFieldsChange({
      xField: value,
      yField,
      groupByField
    });
  };
  
  const handleYFieldChange = (value: string) => {
    onFieldsChange({
      xField,
      yField: value,
      groupByField
    });
  };
  
  const handleGroupByFieldChange = (value: string) => {
    onFieldsChange({
      xField,
      yField,
      groupByField: value === "none" ? undefined : value
    });
  };
  
  // If no fields are available, show a message
  if (fields.length === 0) {
    return (
      <div className="text-center py-4 text-slate-500">
        No fields available
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <Select
          label="X-Axis (Categories)"
          options={fieldOptions}
          value={xField}
          onChange={handleXFieldChange}
          helperText="Field to use for the x-axis (typically categories, names, or dates)"
        />
        
        <Select
          label="Y-Axis (Values)"
          options={fieldOptions}
          value={yField}
          onChange={handleYFieldChange}
          helperText="Field to use for the y-axis (typically numeric values)"
        />
        
        <Select
          label="Group By (Optional)"
          options={[
            { value: "none", label: "None" },
            ...fieldOptions
          ]}
          value={groupByField || "none"}
          onChange={handleGroupByFieldChange}
          helperText="Field to group data by (creates multiple data series)"
        />
      </div>
      
      {xField && yField && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
          <h4 className="text-sm font-medium text-blue-700 mb-1">Current Mapping</h4>
          <ul className="text-xs text-blue-600 space-y-1">
            <li><span className="font-medium">X-Axis:</span> {xField}</li>
            <li><span className="font-medium">Y-Axis:</span> {yField}</li>
            {groupByField && <li><span className="font-medium">Group By:</span> {groupByField}</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
