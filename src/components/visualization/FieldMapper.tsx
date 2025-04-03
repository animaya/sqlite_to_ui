/**
 * Field Mapper Component
 * 
 * Allows users to map database fields to chart axes.
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
  const fieldOptions = fields.map(field => ({
    value: field,
    label: field
  }));
  
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
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="X-Axis (Categories)"
          options={fieldOptions}
          value={xField}
          onChange={handleXFieldChange}
        />
        
        <Select
          label="Y-Axis (Values)"
          options={fieldOptions}
          value={yField}
          onChange={handleYFieldChange}
        />
        
        <Select
          label="Group By (Optional)"
          options={[
            { value: "none", label: "None" },
            ...fieldOptions
          ]}
          value={groupByField || "none"}
          onChange={handleGroupByFieldChange}
        />
      </div>
    </div>
  );
}
