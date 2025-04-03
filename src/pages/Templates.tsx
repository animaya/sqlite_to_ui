/**
 * Templates Page
 * 
 * Page for browsing and applying insight templates.
 */

import { useSignal } from "@preact/signals";
import Button from "../components/common/Button.tsx";
import Card from "../components/common/Card.tsx";
import TemplateConfigurator from "../components/templates/TemplateConfigurator.tsx";
import TemplateList from "../components/templates/TemplateList.tsx";

interface Template {
  id: number;
  name: string;
  description: string;
  type: string;
  category: string;
  fields: {
    id: string;
    name: string;
    description: string;
    required: boolean;
  }[];
}

interface TemplatesPageProps {
  connectionId: number;
  tableId: string;
}

export default function TemplatesPage({
  connectionId,
  tableId
}: TemplatesPageProps) {
  const templates = useSignal<Template[]>([]);
  const tableFields = useSignal<string[]>([]);
  const selectedTemplate = useSignal<Template | null>(null);
  
  // TODO: Implement loading templates
  // TODO: Implement loading table fields
  
  const handleSelectTemplate = (id: number) => {
    const template = templates.value.find(t => t.id === id);
    if (template) {
      selectedTemplate.value = template;
    }
  };
  
  const handleApplyTemplate = (mappings: Record<string, string>) => {
    if (!selectedTemplate.value) return;
    
    // TODO: Implement applying template
    // This should:
    // 1. Send the mappings to the server
    // 2. Get back a chart configuration
    // 3. Navigate to the visualization page with this config
    
    console.log("Apply template", selectedTemplate.value.id, "with mappings", mappings);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-900">Insight Templates</h2>
        <Button
          variant="secondary"
          onClick={() => {
            // TODO: Navigate back to table viewer
          }}
        >
          Back to Table
        </Button>
      </div>
      
      {selectedTemplate.value ? (
        <Card>
          <TemplateConfigurator
            templateName={selectedTemplate.value.name}
            templateFields={selectedTemplate.value.fields}
            tableFields={tableFields.value}
            onApply={handleApplyTemplate}
            onCancel={() => {
              selectedTemplate.value = null;
            }}
          />
        </Card>
      ) : (
        <Card>
          <TemplateList
            templates={templates.value}
            onSelect={handleSelectTemplate}
          />
        </Card>
      )}
    </div>
  );
}
