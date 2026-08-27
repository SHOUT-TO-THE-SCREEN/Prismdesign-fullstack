import express, { type Request } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { rateLimit } from "express-rate-limit";
import authRouter from "./auth.js";
import { config } from "./config.js";
import {
  deleteGraph,
  getGraph,
  listGraphs,
  renameGraph,
  saveGraph,
  type GraphPayload,
} from "./db/graphs.js";

const GRAPH_NAME_PATTERN = /^[\p{L}\p{N} _-]{1,100}$/u;

function getUserId(req: Request): string | null {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) return null;
  try {
    const payload = jwt.verify(
      authorization.slice(7),
      config.jwtSecret,
    ) as { id?: string };
    return typeof payload.id === "string" ? payload.id : null;
  } catch {
    return null;
  }
}

function graphName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return GRAPH_NAME_PATTERN.test(normalized) ? normalized : null;
}

function graphPayload(value: unknown): GraphPayload | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  if (!Array.isArray(body.nodes) || !Array.isArray(body.edges)) return null;
  if (!body.paramsById || typeof body.paramsById !== "object" || Array.isArray(body.paramsById)) return null;
  if (!body.nodeKindById || typeof body.nodeKindById !== "object" || Array.isArray(body.nodeKindById)) return null;
  if (body.thumbnail !== undefined && body.thumbnail !== null && typeof body.thumbnail !== "string") return null;
  if (body.nodeKinds !== undefined && (!Array.isArray(body.nodeKinds) || body.nodeKinds.some((kind) => typeof kind !== "string"))) return null;

  return {
    nodes: body.nodes,
    edges: body.edges,
    paramsById: body.paramsById as Record<string, unknown>,
    nodeKindById: body.nodeKindById as Record<string, unknown>,
    thumbnail: (body.thumbnail as string | null | undefined) ?? null,
    nodeCount: body.nodes.length,
    edgeCount: body.edges.length,
    nodeKinds: (body.nodeKinds as string[] | undefined) ?? [],
  };
}

function isUniqueViolation(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505",
  );
}

const app = express();
if (config.isProduction) app.set("trust proxy", 1);

app.disable("x-powered-by");
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.frontendOrigins.includes(origin.replace(/\/$/, ""))) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin is not allowed by CORS"));
    },
  }),
);
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 50,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
  authRouter,
);

app.get("/api/graphs", async (req, res, next) => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  try {
    res.json(await listGraphs(userId));
  } catch (error) {
    next(error);
  }
});

app.get("/api/graphs/:name", async (req, res, next) => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const name = graphName(req.params.name);
  if (!name) {
    res.status(400).json({ error: "Invalid graph name" });
    return;
  }
  try {
    const graph = await getGraph(userId, name);
    if (!graph) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(graph);
  } catch (error) {
    next(error);
  }
});

app.post("/api/graphs/:name", async (req, res, next) => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const name = graphName(req.params.name);
  const payload = graphPayload(req.body);
  if (!name) {
    res.status(400).json({ error: "Invalid graph name" });
    return;
  }
  if (!payload) {
    res.status(400).json({ error: "Invalid graph payload" });
    return;
  }
  try {
    await saveGraph(userId, name, payload);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/graphs/:name/rename", async (req, res, next) => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const oldName = graphName(req.params.name);
  const newName = graphName((req.body as { newName?: unknown }).newName);
  if (!oldName || !newName) {
    res.status(400).json({ error: "Invalid graph name" });
    return;
  }
  try {
    if (!(await renameGraph(userId, oldName, newName))) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ ok: true });
  } catch (error) {
    if (isUniqueViolation(error)) {
      res.status(409).json({ error: "A graph with that name already exists" });
      return;
    }
    next(error);
  }
});

app.delete("/api/graphs/:name", async (req, res, next) => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const name = graphName(req.params.name);
  if (!name) {
    res.status(400).json({ error: "Invalid graph name" });
    return;
  }
  try {
    if (!(await deleteGraph(userId, name))) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  if (error instanceof SyntaxError) {
    res.status(400).json({ error: "Invalid JSON body" });
    return;
  }
  if (error instanceof Error && error.message === "Origin is not allowed by CORS") {
    res.status(403).json({ error: "Origin is not allowed" });
    return;
  }
  res.status(500).json({ error: "Internal server error" });
});

app.listen(config.port, "0.0.0.0", () => {
  console.log(`PrismDesign API listening on port ${config.port}`);
});
