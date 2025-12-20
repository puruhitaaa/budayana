/**
 * User Progress API routes (requires authentication)
 */
import { Elysia, t } from "elysia"
import {
  SuccessResponseSchema,
  ErrorResponseSchema,
} from "../../lib/utils/schemas"
import { auth } from "../../lib/auth"
import {
  ProgressQuerySchema,
  UpsertProgressSchema,
  UpdateProgressSchema,
  PaginatedProgressSchema,
  UserProgressSchema,
} from "./schema"
import * as progressService from "./service"

export const progressRoutes = new Elysia({ prefix: "/progress" })
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
   * GET /api/progress - Get user's progress for all islands
   */
  .get(
    "/",
    async ({ query, user, set }) => {
      if (!user) {
        set.status = 401
        return { error: "Unauthorized", code: "UNAUTHORIZED" }
      }

      const { cursor, limit, sortBy, sortOrder, isUnlocked, isCompleted } =
        query

      const result = await progressService.getUserProgress(
        user.id,
        { cursor, limit, sortBy, sortOrder },
        { isUnlocked, isCompleted }
      )

      return result
    },
    {
      query: ProgressQuerySchema,
      detail: {
        tags: ["Progress"],
        summary: "Get my progress",
        description: "Get progress for all islands",
      },
      response: {
        200: PaginatedProgressSchema,
        401: ErrorResponseSchema,
      },
    }
  )

  /**
   * GET /api/progress/:islandId - Get progress for specific island
   */
  .get(
    "/:islandId",
    async ({ params, user, set }) => {
      if (!user) {
        set.status = 401
        return { error: "Unauthorized", code: "UNAUTHORIZED" }
      }

      const progress = await progressService.getProgressByIsland(
        user.id,
        params.islandId
      )

      if (!progress) {
        set.status = 404
        return { error: "Progress not found", code: "NOT_FOUND" }
      }

      return progress
    },
    {
      params: t.Object({ islandId: t.String() }),
      detail: {
        tags: ["Progress"],
        summary: "Get progress for island",
      },
      response: {
        200: UserProgressSchema,
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
    }
  )

  /**
   * POST /api/progress - Create or update progress
   */
  .post(
    "/",
    async ({ body, user, set }) => {
      if (!user) {
        set.status = 401
        return { error: "Unauthorized", code: "UNAUTHORIZED" }
      }

      const progress = await progressService.upsertProgress(user.id, body)
      return progress
    },
    {
      body: UpsertProgressSchema,
      detail: {
        tags: ["Progress"],
        summary: "Create or update progress",
      },
      response: {
        200: UserProgressSchema,
        401: ErrorResponseSchema,
      },
    }
  )

  /**
   * PATCH /api/progress/:id - Update progress by ID
   */
  .patch(
    "/:id",
    async ({ params, body, user, set }) => {
      if (!user) {
        set.status = 401
        return { error: "Unauthorized", code: "UNAUTHORIZED" }
      }

      const belongsToUser = await progressService.progressBelongsToUser(
        params.id,
        user.id
      )
      if (!belongsToUser) {
        set.status = 404
        return { error: "Progress not found", code: "NOT_FOUND" }
      }

      const progress = await progressService.updateProgress(params.id, body)
      return progress
    },
    {
      params: t.Object({ id: t.String() }),
      body: UpdateProgressSchema,
      detail: {
        tags: ["Progress"],
        summary: "Update progress",
      },
      response: {
        200: UserProgressSchema,
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
    }
  )

  /**
   * POST /api/progress/initialize - Initialize progress for all islands
   */
  .post(
    "/initialize",
    async ({ user, set }) => {
      if (!user) {
        set.status = 401
        return { error: "Unauthorized", code: "UNAUTHORIZED" }
      }

      await progressService.initializeUserProgress(user.id)
      return { success: true, message: "Progress initialized for all islands" }
    },
    {
      response: {
        200: SuccessResponseSchema,
        401: ErrorResponseSchema,
      },
      detail: {
        tags: ["Progress"],
        summary: "Initialize progress",
        description: "Create progress records for all islands",
      },
    }
  )
