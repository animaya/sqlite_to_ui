/**
 * Connections Page
 * 
 * Page for managing database connections.
 */

import { useSignal } from "@preact/signals";
import Button from "../components/common/Button.tsx";
import Card from "../components/common/Card.tsx";
import ConnectionForm from "../components/connection/ConnectionForm.tsx";
import ConnectionList from "../components/connection/ConnectionList.tsx";

export default function ConnectionsPage() {
  const isFormVisible = useSignal(false);
  const connections = useSignal<any[]>([]);
  
  const toggleForm = () => {
    isFormVisible.value = !isFormVisible.value;
  };
  
  // TODO: Implement loading connections
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-900">Database Connections</h2>
        <Button onClick={toggleForm}>
          {isFormVisible.value ? "Cancel" : "Add Connection"}
        </Button>
      </div>
      
      {isFormVisible.value && (
        <Card title="New Connection">
          <ConnectionForm
            onSubmit={() => {
              // TODO: Implement form submission
              isFormVisible.value = false;
            }}
            onCancel={() => {
              isFormVisible.value = false;
            }}
          />
        </Card>
      )}
      
      <Card>
        <ConnectionList
          connections={connections.value}
          onSelect={(id) => {
            // TODO: Implement connection selection
            console.log("Selected connection:", id);
          }}
          onDelete={(id) => {
            // TODO: Implement connection deletion
            console.log("Delete connection:", id);
          }}
        />
      </Card>
    </div>
  );
}
