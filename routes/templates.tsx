import { Head } from "$fresh/runtime.ts";

export default function Templates() {
  return (
    <>
      <Head>
        <title>Visualization Templates - SQLite Visualizer</title>
        <link rel="stylesheet" href="/static/styles.css" />
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <h1 class="text-3xl font-bold mb-6">Visualization Templates</h1>
        
        <div class="bg-purple-100 border-l-4 border-purple-500 text-purple-700 p-4 mb-6">
          <p>Create and manage visualization templates to quickly generate charts from your data.</p>
        </div>
        
        <div class="border rounded-lg p-6 mb-6">
          <h2 class="text-xl font-semibold mb-4">Available Templates</h2>
          
          <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            No templates found. Create a new template to get started.
          </div>
          
          <button 
            class="mt-4 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Create New Template
          </button>
        </div>
        
        <div class="border rounded-lg p-6">
          <h2 class="text-xl font-semibold mb-4">Predefined Templates</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="border p-4 rounded hover:bg-gray-50">
              <h3 class="font-medium">Bar Chart</h3>
              <p class="text-sm text-gray-600 mt-1">Simple bar chart for categorical data</p>
              <button class="mt-2 text-purple-500 hover:text-purple-700 text-sm font-medium">
                Use Template
              </button>
            </div>
            
            <div class="border p-4 rounded hover:bg-gray-50">
              <h3 class="font-medium">Line Chart</h3>
              <p class="text-sm text-gray-600 mt-1">Time series or sequential data visualization</p>
              <button class="mt-2 text-purple-500 hover:text-purple-700 text-sm font-medium">
                Use Template
              </button>
            </div>
            
            <div class="border p-4 rounded hover:bg-gray-50">
              <h3 class="font-medium">Pie Chart</h3>
              <p class="text-sm text-gray-600 mt-1">Distribution or proportion visualization</p>
              <button class="mt-2 text-purple-500 hover:text-purple-700 text-sm font-medium">
                Use Template
              </button>
            </div>
            
            <div class="border p-4 rounded hover:bg-gray-50">
              <h3 class="font-medium">Scatter Plot</h3>
              <p class="text-sm text-gray-600 mt-1">Correlation between two variables</p>
              <button class="mt-2 text-purple-500 hover:text-purple-700 text-sm font-medium">
                Use Template
              </button>
            </div>
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