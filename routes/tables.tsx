import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";

interface TablesData {
  tables: string[];
  error?: string;
}

export const handler: Handlers<TablesData> = {
  async GET(req, ctx) {
    try {
      // Forward request to the API endpoint in server/routes
      const apiUrl = new URL(req.url);
      apiUrl.pathname = "/api/tables";
      
      const response = await fetch(apiUrl.toString());
      const data = await response.json();
      
      return ctx.render({ tables: data.tables || [] });
    } catch (error) {
      console.error("Error fetching tables:", error);
      return ctx.render({ 
        tables: [],
        error: "Failed to load tables. Please check your database connection."
      });
    }
  },
};

export default function Tables({ data }: PageProps<TablesData>) {
  const { tables, error } = data;
  
  return (
    <>
      <Head>
        <title>Browse Tables - SQLite Visualizer</title>
        <link rel="stylesheet" href="/static/styles.css" />
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <h1 class="text-3xl font-bold mb-6">Browse Tables</h1>
        
        {error && (
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {tables.length === 0 && !error ? (
          <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            No tables found. Please make sure you have an active database connection.
          </div>
        ) : (
          <ul class="space-y-2">
            {tables.map((table) => (
              <li key={table} class="border p-4 rounded hover:bg-gray-50">
                <a href={`/tables/${table}`} class="text-blue-500 hover:text-blue-700 font-medium">
                  {table}
                </a>
              </li>
            ))}
          </ul>
        )}
        
        <div class="mt-6">
          <a href="/" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Back to Home
          </a>
        </div>
      </div>
    </>
  );
}