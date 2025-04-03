/**
 * Data Table Component
 * 
 * Displays database table data with sorting and filtering.
 */

import { useSignal } from "@preact/signals";

interface DataTableProps {
  columns: string[];
  rows: Record<string, unknown>[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSort: (column: string, direction: 'asc' | 'desc') => void;
  onFilter: (column: string, value: string) => void;
}

export default function DataTable({
  columns,
  rows,
  total,
  page,
  pageSize,
  onPageChange,
  onSort,
  onFilter
}: DataTableProps) {
  const sortColumn = useSignal("");
  const sortDirection = useSignal<'asc' | 'desc'>('asc');
  const filters = useSignal<Record<string, string>>({});
  
  const handleSort = (column: string) => {
    if (sortColumn.value === column) {
      // Toggle direction if same column
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
      // New column, default to asc
      sortColumn.value = column;
      sortDirection.value = 'asc';
    }
    
    onSort(column, sortDirection.value);
  };
  
  const handleFilter = (column: string, value: string) => {
    filters.value = {
      ...filters.value,
      [column]: value
    };
    
    onFilter(column, value);
  };
  
  const totalPages = Math.ceil(total / pageSize);
  
  if (rows.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500">
        No data found for this table.
      </div>
    );
  }
  
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead>
            <tr className="bg-slate-50">
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center">
                    <span>{column}</span>
                    {sortColumn.value === column && (
                      <span className="ml-1">
                        {sortDirection.value === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
            <tr>
              {columns.map((column) => (
                <th key={`filter-${column}`} className="px-2 py-2 bg-white border-b border-slate-200">
                  <input
                    type="text"
                    placeholder={`Filter ${column}`}
                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded-sm"
                    value={filters.value[column] || ''}
                    onChange={(e) => handleFilter(column, e.currentTarget.value)}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-slate-50">
                {columns.map((column) => (
                  <td key={`${rowIndex}-${column}`} className="px-4 py-3 text-sm text-slate-900">
                    {row[column]?.toString() || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-3 mt-4">
          <button
            className="px-3 py-1 border border-slate-300 rounded-sm text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </button>
          
          <div>
            <span className="text-sm text-slate-700">
              Page {page} of {totalPages}
            </span>
          </div>
          
          <button
            className="px-3 py-1 border border-slate-300 rounded-sm text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
