/**
 * Main Application Component
 * 
 * Handles routing and state management for the application.
 */

import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import MainLayout from "./layouts/MainLayout.tsx";
import ConnectionsPage from "./pages/Connections.tsx";
import TableViewer from "./pages/TableViewer.tsx";
import Templates from "./pages/Templates.tsx";
import VisualizationBuilder from "./pages/VisualizationBuilder.tsx";
import SavedVisualizations from "./pages/SavedVisualizations.tsx";

// Define the possible routes/pages
type Route = 
  | 'connections'
  | 'tableViewer'
  | 'templates'
  | 'visualizationBuilder'
  | 'savedVisualizations';

// Main App component (both default and named export)
export function App() {
  // Current route/page
  const currentRoute = useSignal<Route>('connections');
  
  // Parameters for the current route
  const routeParams = useSignal<Record<string, any>>({});
  
  // Navigation history for back/forward navigation
  const navigationHistory = useSignal<{ route: Route; params: Record<string, any> }[]>([]);
  const historyPosition = useSignal(0);
  
  // Handle navigation between pages
  const navigate = (route: Route, params: Record<string, any> = {}) => {
    // If we're not at the end of the history, truncate it
    if (historyPosition.value < navigationHistory.value.length - 1) {
      navigationHistory.value = navigationHistory.value.slice(0, historyPosition.value + 1);
    }
    
    // Add the new route to history
    navigationHistory.value = [
      ...navigationHistory.value,
      { route, params }
    ];
    
    // Update the history position
    historyPosition.value = navigationHistory.value.length - 1;
    
    // Update the current route and params
    currentRoute.value = route;
    routeParams.value = params;
  };
  
  // Handle browser back button
  const goBack = () => {
    if (historyPosition.value > 0) {
      historyPosition.value--;
      const { route, params } = navigationHistory.value[historyPosition.value];
      currentRoute.value = route;
      routeParams.value = params;
    }
  };
  
  // Handle browser forward button
  const goForward = () => {
    if (historyPosition.value < navigationHistory.value.length - 1) {
      historyPosition.value++;
      const { route, params } = navigationHistory.value[historyPosition.value];
      currentRoute.value = route;
      routeParams.value = params;
    }
  };
  
  // Initialize history with the current route
  useEffect(() => {
    if (navigationHistory.value.length === 0) {
      navigationHistory.value = [{ route: currentRoute.value, params: {} }];
    }
  }, []);
  
  // Handle browser history events
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        const { route, params, position } = event.state;
        currentRoute.value = route;
        routeParams.value = params;
        historyPosition.value = position;
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  
  // Render the current page based on the route
  const renderCurrentPage = () => {
    switch (currentRoute.value) {
      case 'connections':
        return (
          <ConnectionsPage 
            onSelect={(connectionId) => navigate('tableViewer', { connectionId })}
          />
        );
      
      case 'tableViewer':
        return (
          <TableViewer 
            connectionId={routeParams.value.connectionId}
            onNavigate={navigate}
          />
        );
      
      case 'templates':
        return (
          <Templates 
            connectionId={routeParams.value.connectionId}
            tableName={routeParams.value.tableName}
            onNavigate={navigate}
          />
        );
      
      case 'visualizationBuilder':
        return (
          <VisualizationBuilder 
            connectionId={routeParams.value.connectionId}
            tableId={routeParams.value.tableName}
            chartConfig={routeParams.value.chartConfig}
            onNavigate={navigate}
          />
        );
      
      case 'savedVisualizations':
        return (
          <SavedVisualizations 
            onNavigate={navigate}
          />
        );
      
      default:
        return (
          <div className="p-8 text-center">
            <h2 className="text-xl font-medium text-slate-900 mb-2">Page Not Found</h2>
            <p className="text-slate-500 mb-4">The page you are looking for does not exist.</p>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => navigate('connections')}
            >
              Go to Home
            </button>
          </div>
        );
    }
  };
  
  return (
    <MainLayout>
      {renderCurrentPage()}
    </MainLayout>
  );
}

// Default export (for backward compatibility)
export default App;
