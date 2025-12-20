import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { openAPI } from "better-auth/plugins"
import prisma from "../db"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [openAPI()],
  user: {
    additionalFields: {
      grade: {
        type: "number",
      },
      username: {
        type: "string",
        input: true,
        unique: true,
      },
      guardianEmail: {
        type: "string",
        input: true,
      },
      totalXp: {
        type: "number",
        input: false,
        defaultValue: 0,
      },
    },
  },
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
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
