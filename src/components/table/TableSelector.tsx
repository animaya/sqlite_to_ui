/**
 * Table Selector Component
 * 
 * Allows users to select tables from a database.
 */

import { useSignal } from "@preact/signals";
import Select from "../common/Select.tsx";

interface TableSelectorProps {
  tables: string[];
  selectedTable: string;
  onSelect: (table: string) => void;
}

export default function TableSelector({
  tables,
  selectedTable,
  onSelect
}: TableSelectorProps) {
  const options = tables.map(table => ({
    value: table,
    label: table
  }));
  
  return (
    <div className="flex items-end space-x-4">
      <Select
        label="Select Table"
        options={options}
        value={selectedTable}
        onChange={onSelect}
        className="min-w-[200px]"
      />
    </div>
  );
}
