import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { openAPI } from "better-auth/plugins"
import prisma from "../db"

export const allowedOrigins = [
  process.env.CORS_ORIGIN || "",
  "http://localhost:5173",
].filter(Boolean)

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  basePath: "/api",
  plugins: [openAPI()],
  user: {
    additionalFields: {
      grade: {
        type: "number",
        input: true,
        required: true,
        fieldName: "grade",
        references: {
          model: "User",
          field: "grade",
        },
      },
      username: {
        type: "string",
        input: true,
        unique: true,
        required: true,
        fieldName: "username",
        references: {
          model: "User",
          field: "username",
        },
      },
      guardianEmail: {
        type: "string",
        input: true,
        required: true,
        fieldName: "guardianEmail",
        references: {
          model: "User",
          field: "guardianEmail",
        },
      },
      totalXp: {
        type: "number",
        input: false,
        fieldName: "totalXp",
        defaultValue: 0,
      },
    },
  },
  trustedOrigins: allowedOrigins,
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
})
