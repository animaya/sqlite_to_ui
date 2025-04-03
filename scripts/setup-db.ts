/**
 * Database Setup Script
 * 
 * Initializes the application database with the required tables.
 */

import { DB } from "sqlite";
import { CREATE_TABLE_SQL as CREATE_CONNECTIONS_TABLE } from "../server/models/connection.ts";
import { CREATE_TABLE_SQL as CREATE_VISUALIZATIONS_TABLE } from "../server/models/visualization.ts";
import { CREATE_TABLE_SQL as CREATE_TEMPLATES_TABLE } from "../server/models/template.ts";

// Default templates to add to the database
const DEFAULT_TEMPLATES = [
  {
    name: "Top Items Analysis",
    description: "Identifies the highest-performing items based on a numeric value",
    type: "bar",
    config: JSON.stringify({
      type: "bar",
      options: {
        plugins: {
          title: {
            display: true,
            text: "Top Items"
          }
        }
      }
    }),
    category: "Performance",
    is_default: 1
  },
  {
    name: "Trend Over Time",
    description: "Visualizes how a metric changes over time",
    type: "line",
    config: JSON.stringify({
      type: "line",
      options: {
        plugins: {
          title: {
            display: true,
            text: "Trend Analysis"
          }
        }
      }
    }),
    category: "Trends",
    is_default: 1
  },
  {
    name: "Distribution Analysis",
    description: "Shows how values are distributed across categories",
    type: "pie",
    config: JSON.stringify({
      type: "pie",
      options: {
        plugins: {
          title: {
            display: true,
            text: "Distribution Analysis"
          }
        }
      }
    }),
    category: "Analysis",
    is_default: 1
  }
];

/**
 * Initialize the application database
 */
async function initDatabase() {
  console.log("Initializing application database...");
  
  // Open database connection
  const db = new DB("sqlite_visualizer_app.db");
  
  try {
    // Create tables
    db.execute(CREATE_CONNECTIONS_TABLE);
    console.log("Created connections table");
    
    db.execute(CREATE_VISUALIZATIONS_TABLE);
    console.log("Created visualizations table");
    
    db.execute(CREATE_TEMPLATES_TABLE);
    console.log("Created templates table");
    
    // Add default templates
    const insertTemplateSQL = `
      INSERT INTO insight_templates (
        name, description, type, config, category, is_default
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    for (const template of DEFAULT_TEMPLATES) {
      db.query(
        insertTemplateSQL,
        [
          template.name,
          template.description,
          template.type,
          template.config,
          template.category,
          template.is_default
        ]
      );
    }
    
    console.log(`Added ${DEFAULT_TEMPLATES.length} default templates`);
    
    console.log("Database initialization complete");
  } catch (error) {
    console.error("Error initializing database:", error);
  } finally {
    // Close database connection
    db.close();
  }
}

// Run the initialization
initDatabase();
