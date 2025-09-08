/**
 * Training Routes
 * Express routes that use the isolated training module
 */

import { Router } from "express";
import { TrainingModuleFactory } from "../factories/TrainingModuleFactory";
import { ITrainingModule } from "../interfaces/ITrainingModule";
import { storage } from "../storage";

export function createTrainingRoutes(): Router {
  const router = Router();
  const trainingModule: ITrainingModule = TrainingModuleFactory.createTrainingModule();

  // === SPECIALTY ROUTES ===

  // Get all specialties
  router.get("/specialties", async (req, res) => {
    try {
      const specialties = await trainingModule.getSpecialties();
      res.json(specialties);
    } catch (error) {
      console.error("Error fetching specialties:", error);
      res.status(500).json({ error: "Failed to fetch specialties" });
    }
  });

  // Create specialty
  router.post("/specialties", async (req, res) => {
    try {
      const { name, description, domain, requiredKnowledge, competencyLevels } = req.body;
      
      if (!name || !domain) {
        return res.status(400).json({ error: "Name and domain are required" });
      }

      const specialty = await trainingModule.createSpecialty({
        name,
        description,
        domain,
        requiredKnowledge: requiredKnowledge || [],
        competencyLevels: competencyLevels || ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      });

      res.status(201).json(specialty);
    } catch (error) {
      console.error("Error creating specialty:", error);
      res.status(500).json({ error: "Failed to create specialty" });
    }
  });

  // Update specialty
  router.put("/specialties/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const specialty = await trainingModule.updateSpecialty(id, updates);
      res.json(specialty);
    } catch (error) {
      console.error("Error updating specialty:", error);
      res.status(500).json({ error: "Failed to update specialty" });
    }
  });

  // Delete specialty
  router.delete("/specialties/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await trainingModule.deleteSpecialty(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting specialty:", error);
      res.status(500).json({ error: "Failed to delete specialty" });
    }
  });

  // Archive specialty (hide from view)
  router.put("/specialties/:id/archive", async (req, res) => {
    try {
      const { id } = req.params;
      const specialty = await trainingModule.updateSpecialty(id, { isArchived: true });
      res.json(specialty);
    } catch (error) {
      console.error("Error archiving specialty:", error);
      res.status(500).json({ error: "Failed to archive specialty" });
    }
  });

  // Unarchive specialty (show in view)
  router.put("/specialties/:id/unarchive", async (req, res) => {
    try {
      const { id } = req.params;
      const specialty = await trainingModule.updateSpecialty(id, { isArchived: false });
      res.json(specialty);
    } catch (error) {
      console.error("Error unarchiving specialty:", error);
      res.status(500).json({ error: "Failed to unarchive specialty" });
    }
  });

  // === AGENT ROUTES ===
  
  // Get all agents available for training
  router.get("/agents", async (req, res) => {
    try {
      // Get agents from the main storage system (now database-backed)
      const agents = await storage.getAgentLibraries();
      res.json(agents);
    } catch (error) {
      console.error("Error fetching training agents:", error);
      res.status(500).json({ error: "Failed to fetch agents" });
    }
  });

  // Get specific agent details for training
  router.get("/agents/:agentId", async (req, res) => {
    try {
      const { agentId } = req.params;
      const agent = await storage.getAgentLibrary(agentId);
      
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }

      res.json(agent);
    } catch (error) {
      console.error("Error fetching agent:", error);
      res.status(500).json({ error: "Failed to fetch agent" });
    }
  });

  // === SESSION ROUTES ===

  // Get all training sessions
  router.get("/sessions", async (req, res) => {
    try {
      const sessions = await trainingModule.getAllTrainingSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ error: "Failed to fetch training sessions" });
    }
  });

  // Get training sessions for an agent
  router.get("/agents/:agentId/sessions", async (req, res) => {
    try {
      const { agentId } = req.params;
      const sessions = await trainingModule.getAgentTrainingSessions(agentId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching agent sessions:", error);
      res.status(500).json({ error: "Failed to fetch agent training sessions" });
    }
  });

  // Start training session
  router.post("/sessions", async (req, res) => {
    try {
      const { agentId, specialtyId, targetCompetencyLevel, maxIterations } = req.body;

      if (!agentId || !specialtyId || !targetCompetencyLevel) {
        return res.status(400).json({ 
          error: "agentId, specialtyId, and targetCompetencyLevel are required" 
        });
      }

      const session = await trainingModule.startTrainingSession({
        agentId,
        specialtyId,
        targetCompetencyLevel,
        maxIterations,
      });

      res.status(201).json(session);
    } catch (error) {
      console.error("Error starting training session:", error);
      res.status(500).json({ error: "Failed to start training session" });
    }
  });

  // Get specific training session
  router.get("/sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const session = await trainingModule.getTrainingSession(id);
      
      if (!session) {
        return res.status(404).json({ error: "Training session not found" });
      }

      res.json(session);
    } catch (error) {
      console.error("Error fetching training session:", error);
      res.status(500).json({ error: "Failed to fetch training session" });
    }
  });

  // Get training progress
  router.get("/sessions/:id/progress", async (req, res) => {
    try {
      const { id } = req.params;
      const progress = await trainingModule.getTrainingProgress(id);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching training progress:", error);
      res.status(500).json({ error: "Failed to fetch training progress" });
    }
  });

  // === TEST ROUTES ===

  // Generate test for session
  router.post("/sessions/:id/test", async (req, res) => {
    try {
      const { id } = req.params;
      const { testType = "competency" } = req.body;

      const test = await trainingModule.generateTest(id, testType);
      res.status(201).json(test);
    } catch (error) {
      console.error("Error generating test:", error);
      res.status(500).json({ error: "Failed to generate test" });
    }
  });

  // Submit test attempt
  router.post("/tests/:testId/attempt", async (req, res) => {
    try {
      const { testId } = req.params;
      const { sessionId, answers } = req.body;

      if (!sessionId || !answers) {
        return res.status(400).json({ error: "sessionId and answers are required" });
      }

      const attempt = await trainingModule.submitTestAttempt(testId, sessionId, answers);
      res.status(201).json(attempt);
    } catch (error) {
      console.error("Error submitting test attempt:", error);
      res.status(500).json({ error: "Failed to submit test attempt" });
    }
  });

  // Get tests for session
  router.get("/sessions/:id/tests", async (req, res) => {
    try {
      const { id } = req.params;
      const tests = await trainingModule.getTestsForSession(id);
      res.json(tests);
    } catch (error) {
      console.error("Error fetching tests:", error);
      res.status(500).json({ error: "Failed to fetch tests" });
    }
  });

  // Get test attempts for session
  router.get("/sessions/:id/attempts", async (req, res) => {
    try {
      const { id } = req.params;
      const attempts = await trainingModule.getTestAttemptsForSession(id);
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching test attempts:", error);
      res.status(500).json({ error: "Failed to fetch test attempts" });
    }
  });

  return router;
}