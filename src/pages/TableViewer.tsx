/**
 * Table Viewer Page
 * 
 * Page for viewing and filtering database tables.
 */

import { useSignal } from "@preact/signals";
import Button from "../components/common/Button.tsx";
import Card from "../components/common/Card.tsx";
import DataTable from "../components/table/DataTable.tsx";
import TableSelector from "../components/table/TableSelector.tsx";

interface TableViewerProps {
  connectionId: number;
}

export default function TableViewer({ connectionId }: TableViewerProps) {
  const tables = useSignal<string[]>([]);
  const selectedTable = useSignal<string>("");
  const columns = useSignal<string[]>([]);
  const rows = useSignal<Record<string, unknown>[]>([]);
  const total = useSignal(0);
  const page = useSignal(1);
  const pageSize = useSignal(10);
  
  // TODO: Implement loading tables
  // TODO: Implement loading table data
  
  const handleTableSelect = (table: string) => {
    selectedTable.value = table;
    // TODO: Load table data
  };
  
  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    // TODO: Implement sorting
  };
  
  const handleFilter = (column: string, value: string) => {
    // TODO: Implement filtering
  };
  
  const handlePageChange = (newPage: number) => {
    page.value = newPage;
    // TODO: Load table data for new page
  };
  
  const handleVisualizeClick = () => {
    // TODO: Navigate to visualization page
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-900">Table Viewer</h2>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            onClick={() => {
              // TODO: Navigate back to connections
            }}
          >
            Back to Connections
          </Button>
          <Button
            variant="primary"
            onClick={handleVisualizeClick}
            disabled={!selectedTable.value}
          >
            Visualize Data
          </Button>
        </div>
      </div>
      
      <Card className="p-4">
        <TableSelector
          tables={tables.value}
          selectedTable={selectedTable.value}
          onSelect={handleTableSelect}
        />
      </Card>
      
      {selectedTable.value && (
        <Card title={`Table: ${selectedTable.value}`}>
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
        </Card>
      )}
    </div>
  );
}
