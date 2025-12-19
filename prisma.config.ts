import dotenv from "dotenv"
import path from "node:path"
import { defineConfig, env } from "prisma/config"

dotenv.config()

export default defineConfig({
  schema: path.join("src", "lib", "db", "prisma", "schema"),
  migrations: {
    path: path.join("src", "lib", "db", "prisma", "migrations"),
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
})
