/**
 * Table Viewer Page
 * 
 * Page for viewing and filtering database tables.
 */

import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import Button from "../components/common/Button.tsx";
import Card from "../components/common/Card.tsx";
import DataTable from "../components/table/DataTable.tsx";
import TableSelector from "../components/table/TableSelector.tsx";
import * as tableService from "../services/tableService.ts";

interface TableViewerProps {
  connectionId: number;
  onNavigate: (page: string, params?: Record<string, unknown>) => void;
}

export default function TableViewer({ connectionId, onNavigate }: TableViewerProps) {
  const tables = useSignal<string[]>([]);
  const selectedTable = useSignal<string>("");
  const columns = useSignal<string[]>([]);
  const rows = useSignal<Record<string, unknown>[]>([]);
  const total = useSignal(0);
  const page = useSignal(1);
  const pageSize = useSignal(10);
  const isLoading = useSignal(false);
  const error = useSignal<string | null>(null);
  
  // Sort state
  const sortColumn = useSignal<string | undefined>(undefined);
  const sortDirection = useSignal<'asc' | 'desc'>('asc');
  
  // Filter state
  const filters = useSignal<Record<string, string>>({});
  
  // Load tables when the component mounts
  useEffect(() => {
    loadTables();
  }, [connectionId]);
  
  // Load table data when the selected table, page, sorting, or filters change
  useEffect(() => {
    if (selectedTable.value) {
      loadTableData();
    }
  }, [selectedTable.value, page.value, sortColumn.value, sortDirection.value, filters.value]);
  
  // Function to load tables from the API
  const loadTables = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const data = await tableService.getTables(connectionId);
      tables.value = data;
      
      // Select the first table by default if available
      if (data.length > 0 && !selectedTable.value) {
        selectedTable.value = data[0];
      }
    } catch (err) {
      console.error("Error loading tables:", err);
      error.value = err instanceof Error ? err.message : "Failed to load tables";
    } finally {
      isLoading.value = false;
    }
  };
  
  // Function to load table data from the API
  const loadTableData = async () => {
    if (!selectedTable.value) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await tableService.getTableData(
        connectionId,
        selectedTable.value,
        page.value,
        pageSize.value,
        sortColumn.value,
        sortDirection.value,
        filters.value
      );
      
      rows.value = result.rows;
      columns.value = result.columns;
      total.value = result.total;
    } catch (err) {
      console.error("Error loading table data:", err);
      error.value = err instanceof Error ? err.message : "Failed to load table data";
    } finally {
      isLoading.value = false;
    }
  };
  
  // Handle table selection
  const handleTableSelect = (table: string) => {
    // Reset pagination, sorting, and filters when changing tables
    page.value = 1;
    sortColumn.value = undefined;
    sortDirection.value = 'asc';
    filters.value = {};
    selectedTable.value = table;
  };
  
  // Handle sorting
  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    sortColumn.value = column;
    sortDirection.value = direction;
  };
  
  // Handle filtering
  const handleFilter = (column: string, value: string) => {
    // Create a new filters object to trigger reactivity
    const newFilters = { ...filters.value };
    
    if (value) {
      newFilters[column] = value;
    } else {
      delete newFilters[column];
    }
    
    filters.value = newFilters;
    // Reset to first page when filtering
    page.value = 1;
  };
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    page.value = newPage;
  };
  
  // Navigate to visualization builder
  const handleVisualizeClick = () => {
    onNavigate('visualizationBuilder', { 
      connectionId, 
      tableName: selectedTable.value 
    });
  };
  
  // Navigate to templates
  const handleTemplatesClick = () => {
    onNavigate('templates', { 
      connectionId, 
      tableName: selectedTable.value 
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-900">Table Viewer</h2>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            onClick={() => onNavigate('connections')}
          >
            Back to Connections
          </Button>
          {selectedTable.value && (
            <>
              <Button
                variant="secondary"
                onClick={handleTemplatesClick}
              >
                View Templates
              </Button>
              <Button
                variant="primary"
                onClick={handleVisualizeClick}
              >
                Visualize Data
              </Button>
            </>
          )}
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
      
      <Card className="p-4">
        {isLoading.value && !selectedTable.value ? (
          <div className="flex justify-center items-center py-4">
            <div className="flex items-center">
              <svg className="animate-spin h-5 w-5 mr-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-slate-600">Loading tables...</span>
            </div>
          </div>
        ) : (
          <TableSelector
            tables={tables.value}
            selectedTable={selectedTable.value}
            onSelect={handleTableSelect}
          />
        )}
      </Card>
      
      {selectedTable.value && (
        <Card title={`Table: ${selectedTable.value}`}>
          {isLoading.value ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex items-center">
                <svg className="animate-spin h-6 w-6 mr-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-slate-600">Loading data...</span>
              </div>
            </div>
          ) : (
            <DataTable
              columns={columns.value}
              rows={rows.value}
              total={total.value}
              page={page.value}
              pageSize={pageSize.value}
              onPageChange={handlePageChange}
              onSort={handleSort}
              onFilter={handleFilter}
            />
          )}
        </Card>
      )}
    </div>
  );
}
