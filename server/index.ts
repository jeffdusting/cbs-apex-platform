import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedSpecialties } from "./seedSpecialties";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize database with default specialties
  await seedSpecialties();
  
  // BULLETPROOF DEPLOYMENT DETECTION - MUST COME BEFORE API ROUTES!
  const nodeEnv = process.env.NODE_ENV || "development";
  const path = await import("path");
  const fs = await import("fs");
  const staticPath = path.resolve(process.cwd(), "dist", "public");
  const indexPath = path.resolve(staticPath, "index.html");
  
  // Detect production by checking if built files exist
  const hasBuiltFiles = fs.existsSync(staticPath) && fs.existsSync(indexPath);
  const isReplitDeployment = process.env.REPLIT_DEPLOYMENT === "1";
  const isExplicitProduction = nodeEnv === "production" || isReplitDeployment;
  
  // AGGRESSIVE DEPLOYMENT DETECTION: If built files exist, assume production
  // unless explicitly running in development with npm run dev
  const isExplicitDevelopment = process.argv.includes('tsx') && nodeEnv === "development";
  const shouldUseStaticServing = hasBuiltFiles && !isExplicitDevelopment;
  
  log("🔍 BULLETPROOF DEPLOYMENT DETECTION:");
  log(`   NODE_ENV: "${nodeEnv}"`);
  log(`   REPLIT_DEPLOYMENT: "${process.env.REPLIT_DEPLOYMENT}"`);  
  log(`   Static path exists: ${fs.existsSync(staticPath)}`);
  log(`   Index.html exists: ${fs.existsSync(indexPath)}`);
  log(`   Has built files: ${hasBuiltFiles}`);
  log(`   Running with tsx: ${process.argv.includes('tsx')}`);
  log(`   Is explicit development: ${isExplicitDevelopment}`);
  log(`   Should use static serving: ${shouldUseStaticServing}`);
  
  if (shouldUseStaticServing) {
    log("🔧 Using static file serving (production mode) - PRIORITY SETUP");
    log(`   Serving from: ${staticPath}`);
    
    // Serve static files FIRST (CSS, JS, images, etc.)
    app.use(express.static(staticPath, {
      maxAge: '1d', // Cache static assets for 1 day
      etag: true
    }));
    
    log("✅ Static assets serving registered (before API routes)");
  }

  // Register API routes AFTER static serving
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Setup Vite or SPA fallback LAST
  if (!shouldUseStaticServing) {
    log("🔧 Using Vite middleware (development mode)");
    await setupVite(app, server);
  } else {
    // SPA fallback - serve index.html for all non-API routes (AFTER API routes)
    app.get("*", (req, res) => {
      log(`   SPA fallback: ${req.path} -> index.html`);
      res.sendFile(indexPath);
    });
    
    log("✅ SPA fallback registered (after API routes)");
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
