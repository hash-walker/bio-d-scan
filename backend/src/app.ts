import express from "express";
import cors from "cors";
import morgan from "morgan";
import { config } from "./config";
import { errorHandler, notFound } from "./middleware/error-handler";
import authRoutes from "./modules/auth/auth.routes";
import farmerRoutes from "./modules/farmer/farmer.routes";
import capturesRoutes from "./modules/captures/captures.routes";
import creditsRoutes from "./modules/credits/credits.routes";
import govRoutes from "./modules/government/gov.routes";
import { getConnectedCount } from "./realtime/ws-server";

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/farmers", farmerRoutes);
app.use("/api/captures", capturesRoutes);
app.use("/api/credits", creditsRoutes);
app.use("/api/gov", govRoutes);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    wsClients: getConnectedCount(),
    timestamp: new Date().toISOString(),
  });
});

// ─── Error handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
