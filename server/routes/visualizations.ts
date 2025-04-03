/**
 * Visualizations API Routes
 * 
 * Handles API endpoints for visualization management.
 */

import { Handlers } from "fresh/server.ts";
import * as visualizationService from "../services/visualizationService.ts";
import { AppError } from "../middleware/errorHandler.ts";
import { createValidator } from "../middleware/dataValidator.ts";

// Validation schema for creating/updating visualizations
const visualizationSchema = {
  connectionId: {
    type: "number",
    required: true
  },
  name: {
    type: "string",
    required: true,
    min: 1,
    max: 100
  },
  type: {
    type: "string",
    required: true,
    enum: ["bar", "line", "pie", "doughnut"]
  },
  config: {
    type: "object",
    required: true
  },
  tableName: {
    type: "string",
    required: true
  }
};

// Create validators
const validateVisualization = createValidator(visualizationSchema);

export const handler: Handlers = {
  /**
   * GET /api/visualizations - List all saved visualizations
   */
  async GET(req, ctx) {
    try {
      const visualizations = await visualizationService.getVisualizations();
      
      return new Response(JSON.stringify(visualizations), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error fetching visualizations:", error);
      throw new AppError("Failed to fetch visualizations", 500);
    }
  },

  /**
   * POST /api/visualizations - Create a new visualization
   */
  async POST(req, ctx) {
    try {
      const body = await req.json();
      
      // Validate the request body
      const { connectionId, name, type, config, tableName } = body;
      
      if (!connectionId || !name || !type || !config || !tableName) {
        throw new AppError("Missing required fields", 400);
      }
      
      // Validate chart type
      const validTypes = ["bar", "line", "pie", "doughnut"];
      if (!validTypes.includes(type)) {
        throw new AppError(`Invalid chart type. Must be one of: ${validTypes.join(", ")}`, 400);
      }
      
      // Create the visualization
      const visualization = await visualizationService.saveVisualization({
        connectionId,
        name,
        type,
        config,
        tableName
      });
      
      return new Response(JSON.stringify(visualization), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      console.error("Error creating visualization:", error);
      throw new AppError(`Failed to create visualization: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  }
};

/**
 * Handler for specific visualization operations
 */
export const visualizationHandler: Handlers = {
  /**
   * GET /api/visualizations/:id - Get visualization details
   */
  async GET(req, ctx) {
    const { id } = ctx.params;
    const visualizationId = parseInt(id);
    
    if (isNaN(visualizationId)) {
      throw new AppError("Invalid visualization ID", 400);
    }
    
    try {
      const visualization = await visualizationService.getVisualizationById(visualizationId);
      
      if (!visualization) {
        throw new AppError(`Visualization not found with ID: ${visualizationId}`, 404);
      }
      
      return new Response(JSON.stringify(visualization), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      console.error(`Error fetching visualization ${visualizationId}:`, error);
      throw new AppError(`Failed to fetch visualization: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  },

  /**
   * PUT /api/visualizations/:id - Update a visualization
   */
  async PUT(req, ctx) {
    const { id } = ctx.params;
    const visualizationId = parseInt(id);
    
    if (isNaN(visualizationId)) {
      throw new AppError("Invalid visualization ID", 400);
    }
    
    try {
      // Verify that the visualization exists
      const existingVisualization = await visualizationService.getVisualizationById(visualizationId);
      
      if (!existingVisualization) {
        throw new AppError(`Visualization not found with ID: ${visualizationId}`, 404);
      }
      
      // Parse and validate the request body
      const body = await req.json();
      const { name, type, config, tableName } = body;
      
      if (!name && !type && !config && !tableName) {
        throw new AppError("No fields provided for update", 400);
      }
      
      // Update the visualization
      const updatedVisualization = await visualizationService.updateVisualization(
        visualizationId,
        name || existingVisualization.name,
        type || existingVisualization.type,
        config || existingVisualization.config,
        tableName || existingVisualization.tableName
      );
      
      return new Response(JSON.stringify(updatedVisualization), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      console.error(`Error updating visualization ${visualizationId}:`, error);
      throw new AppError(`Failed to update visualization: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  },

  /**
   * DELETE /api/visualizations/:id - Delete a visualization
   */
  async DELETE(req, ctx) {
    const { id } = ctx.params;
    const visualizationId = parseInt(id);
    
    if (isNaN(visualizationId)) {
      throw new AppError("Invalid visualization ID", 400);
    }
    
    try {
      // Verify that the visualization exists
      const existingVisualization = await visualizationService.getVisualizationById(visualizationId);
      
      if (!existingVisualization) {
        throw new AppError(`Visualization not found with ID: ${visualizationId}`, 404);
      }
      
      // Delete the visualization
      await visualizationService.deleteVisualization(visualizationId);
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      console.error(`Error deleting visualization ${visualizationId}:`, error);
      throw new AppError(`Failed to delete visualization: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  }
};

/**
 * Handler for visualization preview
 */
export const previewHandler: Handlers = {
  /**
   * POST /api/visualizations/preview - Generate chart preview data
   */
  async POST(req, ctx) {
    try {
      const body = await req.json();
      
      // Validate the request body
      const { connectionId, config } = body;
      
      if (!connectionId || !config) {
        throw new AppError("Missing required fields", 400);
      }
      
      // Generate chart preview data
      const chartData = await visualizationService.createChartPreview(connectionId, config);
      
      return new Response(JSON.stringify(chartData), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      console.error("Error generating chart preview:", error);
      throw new AppError(`Failed to generate chart preview: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  }
};
