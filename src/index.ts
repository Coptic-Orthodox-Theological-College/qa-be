import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import cacheControl from "express-cache-controller";

// Utils
import { logger, morganStream } from "./utils/logger";

// Create Express server
const app: express.Application = express();
const PORT: number = Number(process.env.PORT) || 8080;
const HOST: string = process.env.HOST || "localhost";

// Middleware Setup
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(helmet()); // Helps secure Express apps with various HTTP headers
app.use(morgan("combined", { stream: morganStream })); // HTTP request logger middleware for node.js
app.use(bodyParser.json()); // Parse incoming request bodies in a middleware before your handlers

// Swagger Setup
try {
  const swaggerDocument = YAML.load("./swagger.yaml");
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  logger.error("Unable to load swagger.yaml", error);
}

// Cache Control explain: https://www.npmjs.com/package/express-cache-controller
app.use(
  cacheControl({
    maxAge: 60, // 1 min
    noCache: false,
    noStore: false,
    mustRevalidate: false,
    public: true,
  })
);

// Routes
app.get("/test", (req: Request, res: Response) => {
  res.json({ message: "Hello World!" });
});

// Error Handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start Server
app.listen(PORT, HOST, () => {
  logger.info(`Server listening on port http://${HOST}:${PORT}`);
});
