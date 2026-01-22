const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

// Routers
const userRouter = require("./routes/userRoutes");
const waitListRouter = require("./routes/waitListRoutes");
const creatorRouter = require("./routes/creatorRoutes");
const { globalErrorhandler } = require("./controllers/errorController");

// Swagger spec (your swagger-jsdoc output)
const swaggerSpec = require("./docs/swagger");

const app = express();

// View Engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Security Headers (skip Swagger routes)
app.use((req, res, next) => {
  if (req.path.startsWith("/api-docs")) return next();

  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", "ws://127.0.0.1:*"],
        scriptSrc: ["'self'", "https://js.paystack.co"],
        frameSrc: ["'self'", "https://checkout.paystack.com"],
      },
    },
  })(req, res, next);
});

// CORS
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://coach-x.vercel.app",
    "https://coach-x.vercel.app",
    "https://coach-x-waitlist.vercel.app",
    "https://www.coach-x.xyz",
    "https://server.coach-x.xyz",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

/* ---------------------- Swagger Documentation ---------------------- */
// Raw JSON spec
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).json(swaggerSpec);
});

// Swagger UI (CDN assets - Vercel safe)
app.get("/api-docs", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(`
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>CoachX API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body { margin: 0; padding: 0; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>

    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: "/api-docs.json",
          dom_id: "#swagger-ui",
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: "BaseLayout"
        });
      };
    </script>
  </body>
</html>
  `);
});
/* ------------------------------------------------------------------ */

// Base Endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is currently running....",
  });
});

// API Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/creators", creatorRouter);
app.use("/api/v1/waitlist", waitListRouter);

// Global Error Handler
app.use(globalErrorhandler);

module.exports = app;
