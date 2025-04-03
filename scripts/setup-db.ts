/**
 * Database Setup Script
 * 
 * Initializes the application database with the required tables.
 */

import { DB } from "sqlite";
import { exists } from "https://deno.land/std@0.170.0/fs/mod.ts";
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
        },
        scales: {
          y: {
            beginAtZero: true
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
        },
        scales: {
          y: {
            beginAtZero: true
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
          },
          legend: {
            position: 'right'
          }
        }
      }
    }),
    category: "Analysis",
    is_default: 1
  },
  {
    name: "Comparison by Category",
    description: "Compares values across different categories",
    type: "bar",
    config: JSON.stringify({
      type: "bar",
      options: {
        plugins: {
          title: {
            display: true,
            text: "Category Comparison"
          }
        },
        indexAxis: 'y',
        scales: {
          x: {
            beginAtZero: true
          }
        }
      }
    }),
    category: "Analysis",
    is_default: 1
  },
  {
    name: "Average by Group",
    description: "Calculates and displays averages across groups",
    type: "bar",
    config: JSON.stringify({
      type: "bar",
      options: {
        plugins: {
          title: {
            display: true,
            text: "Group Averages"
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    }),
    category: "Performance",
    is_default: 1
  }
];

// Database file name
const DB_FILE = "sqlite_visualizer_app.db";

/**
 * Check if database already exists and has templates
 */
async function databaseNeedsSetup(): Promise<boolean> {
  // Check if file exists
  if (!(await exists(DB_FILE))) {
    return true;
  }
  
  // Check if templates table exists and has content
  try {
    const db = new DB(DB_FILE);
    
    try {
      // Check if templates table exists
      const tableResult = db.query<[string]>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='insight_templates'"
      );
      
      if (tableResult.length === 0) {
        return true;
      }
      
      // Check if templates exist
      const templateCount = db.query<[number]>(
        "SELECT COUNT(*) FROM insight_templates"
      )[0][0];
      
      return templateCount === 0;
    } finally {
      db.close();
    }
  } catch {
    // If any error occurs, assume setup is needed
    return true;
  }
}

/**
 * Initialize the application database
 */
async function initDatabase() {
  // Check if setup is needed
  if (!(await databaseNeedsSetup())) {
    console.log("Database already initialized, skipping setup");
    return;
  }
  
  console.log("Initializing application database...");
  
  // Open database connection
  const db = new DB(DB_FILE);
  
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
    Deno.exit(1);
  } finally {
    // Close database connection
    db.close();
  }
}

// Run the initialization
initDatabase();
