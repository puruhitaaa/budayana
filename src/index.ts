import "dotenv/config"
import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"
import { openapi, fromTypes } from "@elysiajs/openapi"
import { auth, allowedOrigins } from "./lib/auth"
import { apiRoutes } from "./routes"
import { OpenAPI } from "./lib/auth/config"

const app = new Elysia()
  .use(
    cors({
      origin: allowedOrigins,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  )
  .mount("/auth", auth.handler)
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
  .get("/", () => "OK")

export default app
