import { Head } from "$fresh/runtime.ts";

export default function Connections() {
  return (
    <>
      <Head>
        <title>Database Connections - SQLite Visualizer</title>
        <link rel="stylesheet" href="/static/styles.css" />
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <h1 class="text-3xl font-bold mb-6">Database Connections</h1>
        
        <div class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
          <p>This page allows you to manage your SQLite database connections.</p>
        </div>
        
        <div class="border rounded-lg p-6 mb-6">
          <h2 class="text-xl font-semibold mb-4">Add New Connection</h2>
          <form class="space-y-4">
            <div>
              <label class="block text-gray-700 mb-1" for="name">Connection Name</label>
              <input 
                type="text" 
                id="name" 
                class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="My Database"
              />
            </div>
            
            <div>
              <label class="block text-gray-700 mb-1" for="path">Database Path</label>
              <input 
                type="text" 
                id="path" 
                class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="/path/to/database.db"
              />
            </div>
            
            <button 
              type="submit"
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Connection
            </button>
          </form>
        </div>
        
        <div class="border rounded-lg p-6">
          <h2 class="text-xl font-semibold mb-4">Your Connections</h2>
          <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            No connections found. Add a new connection to get started.
          </div>
        </div>
        
        <div class="mt-6">
          <a href="/" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Back to Home
          </a>
        </div>
      </div>
    </>
  );
}