import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { DB } from "sqlite";

interface TableData {
  tableName: string;
  columns: string[];
  rows: Record<string, unknown>[];
  error?: string;
}

export const handler: Handlers<TableData> = {
  async GET(req, ctx) {
    const tableName = ctx.params.table;
    
    try {
      // Get DB connection
      const DB_PATH = Deno.env.get("DB_PATH") || "./sqlite_visualizer_app.db";
      const db = new DB(DB_PATH);
      
      // Get column info
      const pragma = db.query<[number, string, string, number, unknown, number]>(
        `PRAGMA table_info(${tableName})`
      );
      
      const columns = pragma.map(row => row[1]);
      
      // Get rows (limited to 100 for safety)
      const rawRows = db.query(`SELECT * FROM ${tableName} LIMIT 100`);
      
      // Convert rows to objects with column names
      const rows = rawRows.map(row => {
        const obj: Record<string, unknown> = {};
        columns.forEach((col, i) => {
          obj[col] = row[i];
        });
        return obj;
      });
      
      // Close the database
      db.close();
      
      return ctx.render({ 
        tableName,
        columns,
        rows
      });
    } catch (error) {
      console.error(`Error fetching table ${tableName}:`, error);
      return ctx.render({ 
        tableName,
        columns: [],
        rows: [],
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  },
};

export default function TableView({ data }: PageProps<TableData>) {
  const { tableName, columns, rows, error } = data;
  
  return (
    <>
      <Head>
        <title>{tableName} - SQLite Visualizer</title>
        <link rel="stylesheet" href="/static/styles.css" />
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <h1 class="text-3xl font-bold mb-6">{tableName}</h1>
        
        {error && (
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {rows.length === 0 && !error ? (
          <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            No data found in this table.
          </div>
        ) : (
          <div class="overflow-x-auto">
            <table class="min-w-full bg-white border border-gray-300">
              <thead>
                <tr class="bg-gray-100">
                  {columns.map(column => (
                    <th key={column} class="border border-gray-300 px-4 py-2 text-left">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} class={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    {columns.map(column => (
                      <td key={`${i}-${column}`} class="border border-gray-300 px-4 py-2">
                        {String(row[column] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div class="mt-6 flex gap-4">
          <a href="/tables" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Back to Tables
          </a>
          <a href="/" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Home
          </a>
        </div>
      </div>
    </>
  );
}