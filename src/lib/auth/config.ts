import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { openAPI, username } from "better-auth/plugins"
import prisma from "../db"

export const allowedOrigins = [
  process.env.CORS_ORIGIN || "",
  ...Array.from({ length: 10 }, (_, i) => `http://localhost:${5170 + i}`),
].filter(Boolean)

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  basePath: "/api",
  plugins: [username(), openAPI()],
  user: {
    additionalFields: {
      grade: {
        type: "number",
        input: true,
        required: true,
        fieldName: "grade",
      },
      // username: {
      //   type: "string",
      //   input: true,
      //   unique: true,
      //   required: true,
      //   fieldName: "username",
      //   references: {
      //     model: "User",
      //     field: "username",
      //   },
      // },
      guardianEmail: {
        type: "string",
        input: true,
        required: true,
        fieldName: "guardianEmail",
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

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema())

export const OpenAPI = {
  getPaths: (prefix = "/auth/api") =>
    getSchema().then(({ paths }) => {
      const reference: typeof paths = Object.create(null)

      for (const path of Object.keys(paths)) {
        const key = prefix + path
        reference[key] = paths[path]

        for (const method of Object.keys(paths[path])) {
          const operation = (reference[key] as any)[method]

          operation.tags = ["Better Auth"]
        }
      }

      return reference
    }) as Promise<any>,
  components: getSchema().then(({ components }) => components) as Promise<any>,
} as const
