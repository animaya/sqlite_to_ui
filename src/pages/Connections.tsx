/**
 * Connections Page
 * 
 * Page for managing database connections.
 */

import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import Button from "../components/common/Button.tsx";
import Card from "../components/common/Card.tsx";
import ConnectionForm from "../components/connection/ConnectionForm.tsx";
import ConnectionList from "../components/connection/ConnectionList.tsx";
import * as connectionService from "../services/connectionService.ts";

interface ConnectionsPageProps {
  onSelect: (connectionId: number) => void;
}

export default function ConnectionsPage({ onSelect }: ConnectionsPageProps) {
  const isFormVisible = useSignal(false);
  const connections = useSignal<connectionService.Connection[]>([]);
  const isLoading = useSignal(false);
  const error = useSignal<string | null>(null);
  
  // Load connections when the component mounts
  useEffect(() => {
    loadConnections();
  }, []);
  
  // Function to load connections from the API
  const loadConnections = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const data = await connectionService.getConnections();
      connections.value = data;
    } catch (err) {
      console.error("Error loading connections:", err);
      error.value = err instanceof Error ? err.message : "Failed to load connections";
    } finally {
      isLoading.value = false;
    }
  };
  
  // Toggle the connection form
  const toggleForm = () => {
    isFormVisible.value = !isFormVisible.value;
    // Clear error when toggling form
    error.value = null;
  };
  
  // Handle form submission
  const handleSubmit = async (values: { name: string; path: string }) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await connectionService.createConnection(values.name, values.path);
      isFormVisible.value = false;
      
      // Reload connections to show the new one
      await loadConnections();
    } catch (err) {
      console.error("Error creating connection:", err);
      error.value = err instanceof Error ? err.message : "Failed to create connection";
    } finally {
      isLoading.value = false;
    }
  };
  
  // Handle connection deletion
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this connection?")) {
      return;
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      await connectionService.deleteConnection(id);
      
      // Reload connections
      await loadConnections();
    } catch (err) {
      console.error("Error deleting connection:", err);
      error.value = err instanceof Error ? err.message : "Failed to delete connection";
    } finally {
      isLoading.value = false;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-900">Database Connections</h2>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            onClick={() => onSelect(-1)}
          >
            Saved Visualizations
          </Button>
          <Button onClick={toggleForm}>
            {isFormVisible.value ? "Cancel" : "Add Connection"}
          </Button>
        </div>
      </div>
      
      {error.value && (
        <div className="p-4 rounded-md bg-red-50 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0 text-red-400">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error.value}</p>
            </div>
          </div>
        </div>
      )}
      
      {isFormVisible.value && (
        <Card title="New Connection">
          <ConnectionForm
            onSubmit={handleSubmit}
            onCancel={toggleForm}
          />
        </Card>
      )}
      
      {isLoading.value ? (
        <Card>
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center">
              <svg className="animate-spin h-6 w-6 mr-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-slate-600">Loading...</span>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <ConnectionList
            connections={connections.value}
            onSelect={onSelect}
            onDelete={handleDelete}
          />
        </Card>
      )}
    </div>
  );
}
