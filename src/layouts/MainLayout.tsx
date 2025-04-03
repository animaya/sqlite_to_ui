/**
 * Main Layout
 * 
 * The primary layout component for the application.
 */

import { JSX } from "preact";

interface MainLayoutProps {
  children: JSX.Element | JSX.Element[];
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-slate-900">SQLite Visualizer</h1>
          </div>
          <nav>
            {/* TODO: Implement navigation */}
          </nav>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
      
      <footer className="bg-white border-t border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-4 text-sm text-slate-500 text-center">
          SQLite Visualizer - A simple SQLite database visualization tool
        </div>
      </footer>
    </div>
  );
}
