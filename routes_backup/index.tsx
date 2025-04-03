import { Head } from "$fresh/runtime.ts";

export default function Home() {
  return (
    <>
      <Head>
        <title>SQLite Visualizer</title>
        <link rel="stylesheet" href="/static/styles.css" />
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <h1 class="text-4xl font-bold">SQLite Visualizer</h1>
        <p class="my-6">
          Welcome to the SQLite Visualizer. This application helps you visualize your SQLite database data.
        </p>
        <div class="flex gap-4">
          <a href="/connections" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Manage Connections
          </a>
          <a href="/tables" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Browse Tables
          </a>
          <a href="/templates" class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
            Visualization Templates
          </a>
        </div>
      </div>
    </>
  );
}