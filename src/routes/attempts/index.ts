/**
 * Attempts API routes (requires authentication)
 * Uses state pattern for auth context propagation
 */
import { Elysia, t } from "elysia"
import {
  SuccessResponseSchema,
  ErrorResponseSchema,
} from "../../lib/utils/schemas"
import { auth } from "../../lib/auth"
import {
  AttemptQuerySchema,
  CreateStoryAttemptSchema,
  UpdateStoryAttemptSchema,
  PaginatedAttemptsSchema,
  CreateStageAttemptSchema,
  CreateQuestionLogSchema,
  StoryAttemptSchema,
  StageAttemptSchema,
  QuestionAttemptLogSchema,
} from "./schema"
import * as attemptService from "./service"

export const attemptRoutes = new Elysia({ prefix: "/attempts" })
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
   * GET /api/attempts - List attempts (user can only see their own)
   */
  .get(
    "/",
    async ({ query, user, set }) => {
      if (!user) {
        set.status = 401
        return { error: "Unauthorized", code: "UNAUTHORIZED" }
      }

      const {
        cursor,
        limit,
        sortBy,
        sortOrder,
        storyId,
        islandId,
        isFinished,
      } = query

      // Force userId filter to current user
      const result = await attemptService.getAttempts(
        { cursor, limit, sortBy, sortOrder },
        { userId: user.id, storyId, islandId, isFinished }
      )

      return result
    },
    {
      query: AttemptQuerySchema,
      detail: {
        tags: ["Attempts"],
        summary: "List my attempts",
        description: "Get a paginated list of your story attempts",
      },
      response: {
        200: PaginatedAttemptsSchema,
        401: ErrorResponseSchema,
      },
    }
  )

  /**
   * GET /api/attempts/:id - Get single attempt
   */
  .get(
    "/:id",
    async ({ params, user, set }) => {
      if (!user) {
        set.status = 401
        return { error: "Unauthorized", code: "UNAUTHORIZED" }
      }

      const attempt = await attemptService.getAttemptById(params.id)

      if (!attempt) {
        set.status = 404
        return { error: "Attempt not found", code: "NOT_FOUND" }
      }

      // Users can only view their own attempts
      if (attempt.userId !== user.id) {
        set.status = 403
        return { error: "Forbidden", code: "FORBIDDEN" }
      }

      return attempt
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        tags: ["Attempts"],
        summary: "Get attempt by ID",
      },
      response: {
        200: StoryAttemptSchema, // Assuming this is the correct schema for detailed attempt
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
    }
  )

  /**
   * POST /api/attempts - Start new attempt
   */
  .post(
    "/",
    async ({ body, user, set }) => {
      if (!user) {
        set.status = 401
        return { error: "Unauthorized", code: "UNAUTHORIZED" }
      }

      const attempt = await attemptService.createAttempt(user.id, body.storyId)
      return attempt
    },
    {
      body: CreateStoryAttemptSchema,
      detail: {
        tags: ["Attempts"],
        summary: "Start new attempt",
      },
      response: {
        200: StoryAttemptSchema,
        401: ErrorResponseSchema,
      },
    }
  )

  /**
   * PATCH /api/attempts/:id - Update attempt (finish, add scores)
   */
  .patch(
    "/:id",
    async ({ params, body, user, set }) => {
      if (!user) {
        set.status = 401
        return { error: "Unauthorized", code: "UNAUTHORIZED" }
      }

      const belongsToUser = await attemptService.attemptBelongsToUser(
        params.id,
        user.id
      )
      if (!belongsToUser) {
        set.status = 404
        return { error: "Attempt not found", code: "NOT_FOUND" }
      }

      const attempt = await attemptService.updateAttempt(params.id, body)
      return attempt
    },
    {
      params: t.Object({ id: t.String() }),
      body: UpdateStoryAttemptSchema,
      detail: {
        tags: ["Attempts"],
        summary: "Update attempt",
      },
      response: {
        200: StoryAttemptSchema,
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
    }
  )

  /**
   * DELETE /api/attempts/:id - Delete attempt
   */
  .delete(
    "/:id",
    async ({ params, user, set }) => {
      if (!user) {
        set.status = 401
        return { error: "Unauthorized", code: "UNAUTHORIZED" }
      }

      const belongsToUser = await attemptService.attemptBelongsToUser(
        params.id,
        user.id
      )
      if (!belongsToUser) {
        set.status = 404
        return { error: "Attempt not found", code: "NOT_FOUND" }
      }

      await attemptService.deleteAttempt(params.id)
      return { success: true, message: "Attempt deleted successfully" }
    },
    {
      params: t.Object({ id: t.String() }),
      response: {
        200: SuccessResponseSchema,
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
      detail: {
        tags: ["Attempts"],
        summary: "Delete attempt",
      },
    }
  )

  /**
   * POST /api/attempts/:id/stages - Add stage attempt
   */
  .post(
    "/:id/stages",
    async ({ params, body, user, set }) => {
      if (!user) {
        set.status = 401
        return { error: "Unauthorized", code: "UNAUTHORIZED" }
      }

      const belongsToUser = await attemptService.attemptBelongsToUser(
        params.id,
        user.id
      )
      if (!belongsToUser) {
        set.status = 404
        return { error: "Attempt not found", code: "NOT_FOUND" }
      }

      const stage = await attemptService.createStageAttempt(params.id, body)
      return stage
    },
    {
      params: t.Object({ id: t.String() }),
      body: CreateStageAttemptSchema,
      detail: {
        tags: ["Attempts"],
        summary: "Add stage attempt",
      },
      response: {
        200: StageAttemptSchema,
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
    }
  )

  /**
   * POST /api/attempts/:id/logs - Add question attempt log
   */
  .post(
    "/:id/logs",
    async ({ params, body, user, set }) => {
      if (!user) {
        set.status = 401
        return { error: "Unauthorized", code: "UNAUTHORIZED" }
      }

      const belongsToUser = await attemptService.attemptBelongsToUser(
        params.id,
        user.id
      )
      if (!belongsToUser) {
        set.status = 404
        return { error: "Attempt not found", code: "NOT_FOUND" }
      }

      const log = await attemptService.createQuestionLog(params.id, body)
      return log
    },
    {
      params: t.Object({ id: t.String() }),
      body: CreateQuestionLogSchema,
      detail: {
        tags: ["Attempts"],
        summary: "Add question attempt log",
      },
      response: {
        200: QuestionAttemptLogSchema,
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
    }
  )
