/**
 * Statistics API routes (requires authentication)
 */
import { Elysia } from "elysia"
import { ErrorResponseSchema } from "../../lib/utils/schemas"
import { auth } from "../../lib/auth"
import { StatisticsSchema } from "./schema"
import * as statisticsService from "./service"

export const statisticsRoutes = new Elysia({ prefix: "/statistics" })
  // Auth middleware using derive
  .derive(async ({ request, set }) => {
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session?.user) {
      set.status = 401
      return {
        user: null as { id: string; name: string; email: string } | null,
      }
    }

    return { user: session.user }
  })

  /**
   * GET /api/statistics - Get user aggregated statistics
   */
  .get(
    "/",
    async ({ user, set }) => {
      if (!user) {
        set.status = 401
        return { error: "Unauthorized", code: "UNAUTHORIZED" }
      }

      const stats = await statisticsService.getStatistics(user.id)
      return stats
    },
    {
      detail: {
        tags: ["Statistics"],
        summary: "Get user statistics",
        description:
          "Returns stories completed, total XP, and average test scores",
      },
      response: {
        200: StatisticsSchema,
        401: ErrorResponseSchema,
      },
    }
  )
