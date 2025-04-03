/**
 * Templates API Routes
 * 
 * Handles API endpoints for template management.
 */

import { Handlers } from "fresh/server.ts";
import * as templateService from "../services/templateService.ts";
import * as dbConnector from "../services/databaseConnector.ts";
import * as queryProcessor from "../services/queryProcessor.ts";
import { AppError } from "../middleware/errorHandler.ts";

export const handler: Handlers = {
  /**
   * GET /api/templates - List all templates
   */
  async GET(req, ctx) {
    try {
      const templates = await templateService.getTemplates();
      
      return new Response(JSON.stringify(templates), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error fetching templates:", error);
      throw new AppError("Failed to fetch templates", 500);
    }
  }
};

/**
 * Handler for template detail operations
 */
export const templateHandler: Handlers = {
  /**
   * GET /api/templates/:id - Get template details
   */
  async GET(req, ctx) {
    const { id } = ctx.params;
    const templateId = parseInt(id);
    
    if (isNaN(templateId)) {
      throw new AppError("Invalid template ID", 400);
    }
    
    try {
      const template = await templateService.getTemplate(templateId);
      
      if (!template) {
        throw new AppError(`Template not found with ID: ${templateId}`, 404);
      }
      
      return new Response(JSON.stringify(template), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      console.error(`Error fetching template ${templateId}:`, error);
      throw new AppError(`Failed to fetch template: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  }
};

/**
 * Handler for applying templates
 */
export const applyTemplateHandler: Handlers = {
  /**
   * POST /api/templates/:id/apply - Apply a template to data
   */
  async POST(req, ctx) {
    const { id } = ctx.params;
    const templateId = parseInt(id);
    
    if (isNaN(templateId)) {
      throw new AppError("Invalid template ID", 400);
    }
    
    try {
      const body = await req.json();
      
      if (!body.connectionId || !body.mappings) {
        throw new AppError("Connection ID and field mappings are required", 400);
      }
      
      const connectionId = parseInt(body.connectionId);
      
      if (isNaN(connectionId)) {
        throw new AppError("Invalid connection ID", 400);
      }
      
      // Get the template
      const template = await templateService.getTemplate(templateId);
      
      if (!template) {
        throw new AppError(`Template not found with ID: ${templateId}`, 404);
      }
      
      // Apply the template
      const chartConfig = await templateService.applyTemplate(
        templateId,
        connectionId,
        body.mappings
      );
      
      return new Response(JSON.stringify(chartConfig), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      console.error(`Error applying template ${templateId}:`, error);
      throw new AppError(`Failed to apply template: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  }
};
