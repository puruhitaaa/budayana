import "dotenv/config"
import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"
import { openapi, fromTypes } from "@elysiajs/openapi"
import { auth, OpenAPI } from "./lib/auth"
import { apiRoutes } from "./routes"

const app = new Elysia()
  .use(
    cors({
      origin: process.env.CORS_ORIGIN || "",
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  )
  .use(
    openapi({
      references: fromTypes(),
      documentation: {
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
      },
    })
  )
  .use(apiRoutes)
  .mount("/api/auth", auth.handler)
  .get("/", () => "OK")

export default app
