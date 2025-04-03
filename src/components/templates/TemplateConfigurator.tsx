/**
 * Template Configurator Component
 * 
 * Allows users to configure a template with table fields.
 */

import { useSignal } from "@preact/signals";
import Button from "../common/Button.tsx";
import Select from "../common/Select.tsx";

interface TemplateField {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

interface TemplateConfiguratorProps {
  templateName: string;
  templateFields: TemplateField[];
  tableFields: string[];
  onApply: (mappings: Record<string, string>) => void;
  onCancel: () => void;
}

export default function TemplateConfigurator({
  templateName,
  templateFields,
  tableFields,
  onApply,
  onCancel
}: TemplateConfiguratorProps) {
  // Initialize mappings with empty values
  const initialMappings: Record<string, string> = {};
  templateFields.forEach(field => {
    initialMappings[field.id] = "";
  });
  
  const mappings = useSignal<Record<string, string>>(initialMappings);
  
  const handleFieldChange = (fieldId: string, value: string) => {
    mappings.value = {
      ...mappings.value,
      [fieldId]: value
    };
  };
  
  const handleApply = () => {
    // Check if all required fields are mapped
    const isValid = templateFields
      .filter(field => field.required)
      .every(field => mappings.value[field.id]);
    
    if (isValid) {
      onApply(mappings.value);
    } else {
      // TODO: Show validation error
    }
  };
  
  const fieldOptions = tableFields.map(field => ({
    value: field,
    label: field
  }));
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-slate-900">
        Configure "{templateName}" Template
      </h3>
      
      <div className="space-y-4">
        {templateFields.map(field => (
          <div key={field.id}>
            <Select
              label={field.name + (field.required ? ' *' : '')}
              helperText={field.description}
              options={[
                { value: "", label: "Select a field..." },
                ...fieldOptions
              ]}
              value={mappings.value[field.id]}
              onChange={(value) => handleFieldChange(field.id, value)}
            />
          </div>
        ))}
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          onClick={handleApply}
        >
          Apply Template
        </Button>
      </div>
    </div>
  );
}
