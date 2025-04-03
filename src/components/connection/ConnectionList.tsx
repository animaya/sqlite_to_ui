/**
 * Connection List Component
 * 
 * Displays a list of database connections.
 */

interface Connection {
  id: number;
  name: string;
  path: string;
  lastAccessed: string;
  sizeBytes?: number;
  tableCount?: number;
  isValid: boolean;
}

interface ConnectionListProps {
  connections: Connection[];
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function ConnectionList({
  connections,
  onSelect,
  onDelete
}: ConnectionListProps) {
  if (connections.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500">
        No connections found. Add a connection to get started.
      </div>
    );
  }
  
  const formatBytes = (bytes?: number) => {
    if (bytes === undefined) return "Unknown";
    if (bytes === 0) return "0 Bytes";
    
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead>
          <tr className="bg-slate-50">
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Path
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Last Accessed
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Size
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Tables
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {connections.map((connection) => (
            <tr 
              key={connection.id} 
              className="hover:bg-slate-50 cursor-pointer"
              onClick={() => onSelect(connection.id)}
            >
              <td className="px-4 py-3 text-sm text-slate-900">
                {connection.name}
              </td>
              <td className="px-4 py-3 text-sm text-slate-900">
                {connection.path}
              </td>
              <td className="px-4 py-3 text-sm text-slate-500">
                {formatDate(connection.lastAccessed)}
              </td>
              <td className="px-4 py-3 text-sm text-slate-500">
                {formatBytes(connection.sizeBytes)}
              </td>
              <td className="px-4 py-3 text-sm text-slate-500">
                {connection.tableCount ?? "Unknown"}
              </td>
              <td className="px-4 py-3 text-sm text-right">
                <button 
                  className="text-red-600 hover:text-red-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(connection.id);
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
