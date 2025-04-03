/**
 * Connection Form Component
 * 
 * Form for creating or editing a database connection.
 */

import { useSignal } from "@preact/signals";
import Button from "../common/Button.tsx";
import Input from "../common/Input.tsx";

interface ConnectionFormProps {
  initialValues?: {
    name: string;
    path: string;
  };
  onSubmit: (values: { name: string; path: string }) => void;
  onCancel: () => void;
}

export default function ConnectionForm({
  initialValues = { name: "", path: "" },
  onSubmit,
  onCancel
}: ConnectionFormProps) {
  const name = useSignal(initialValues.name);
  const path = useSignal(initialValues.path);
  const isLoading = useSignal(false);
  const error = useSignal("");
  
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    
    if (!name.value.trim() || !path.value.trim()) {
      error.value = "Name and path are required";
      return;
    }
    
    isLoading.value = true;
    error.value = "";
    
    try {
      // TODO: Implement form validation
      onSubmit({
        name: name.value,
        path: path.value
      });
    } catch (err) {
      error.value = err instanceof Error ? err.message : "An error occurred";
    } finally {
      isLoading.value = false;
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error.value && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error.value}
        </div>
      )}
      
      <Input
        label="Connection Name"
        value={name.value}
        onChange={(e) => name.value = e.currentTarget.value}
        placeholder="My Database"
        required
      />
      
      <Input
        label="Database Path"
        value={path.value}
        onChange={(e) => path.value = e.currentTarget.value}
        placeholder="/path/to/database.sqlite"
        helperText="Full path to the SQLite database file"
        required
      />
      
      <div className="flex justify-end space-x-3 pt-2">
        <Button
          variant="secondary"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isLoading.value}
        >
          Save Connection
        </Button>
      </div>
    </form>
  );
}
