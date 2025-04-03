/**
 * Template List Component
 * 
 * Displays a list of insight templates.
 */

interface InsightTemplate {
  id: number;
  name: string;
  description: string;
  type: string;
  category: string;
}

interface TemplateListProps {
  templates: InsightTemplate[];
  onSelect: (id: number) => void;
}

export default function TemplateList({
  templates,
  onSelect
}: TemplateListProps) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500">
        No templates available.
      </div>
    );
  }
  
  // Group templates by category
  const templatesByCategory: Record<string, InsightTemplate[]> = {};
  templates.forEach(template => {
    const category = template.category || 'Uncategorized';
    if (!templatesByCategory[category]) {
      templatesByCategory[category] = [];
    }
    templatesByCategory[category].push(template);
  });
  
  return (
    <div className="space-y-6">
      {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
        <div key={category}>
          <h3 className="text-md font-medium text-slate-700 mb-3">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryTemplates.map(template => (
              <div
                key={template.id}
                className="border border-slate-200 rounded p-4 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => onSelect(template.id)}
              >
                <div className="flex items-start">
                  <div className="h-8 w-8 flex-shrink-0 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mr-3">
                    {template.type === 'bar' ? '📊' : 
                      template.type === 'line' ? '📈' : 
                      template.type === 'pie' ? '🥧' : '📉'}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-900">{template.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{template.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
