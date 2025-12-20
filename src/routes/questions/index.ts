/**
 * Questions API routes
 */
import { Elysia, t } from "elysia"
import {
  SuccessResponseSchema,
  ErrorResponseSchema,
} from "../../lib/utils/schemas"
import {
  QuestionQuerySchema,
  CreateQuestionSchema,
  UpdateQuestionSchema,
  PaginatedQuestionsSchema,
  QuestionWithOptionsSchema,
  QuestionSchema,
  CreateAnswerOptionSchema,
  UpdateAnswerOptionSchema,
  AnswerOptionSchema,
} from "./schema"
import * as questionService from "./service"

export const questionRoutes = new Elysia({ prefix: "/questions" })
  /**
   * GET /api/questions - List all questions (paginated)
   */
  .get(
    "/",
    async ({ query }) => {
      const {
        cursor,
        limit,
        sortBy,
        sortOrder,
        search,
        storyId,
        stageType,
        questionType,
      } = query

      const result = await questionService.getQuestions(
        { cursor, limit, sortBy, sortOrder },
        { search, storyId, stageType, questionType }
      )

      return result
    },
    {
      query: QuestionQuerySchema,
      response: { 200: PaginatedQuestionsSchema },
      detail: {
        tags: ["Questions"],
        summary: "List all questions",
        description:
          "Get a paginated list of questions with optional filtering",
      },
    }
  )

  /**
   * GET /api/questions/:id - Get single question with options
   */
  .get(
    "/:id",
    async ({ params, set }) => {
      const question = await questionService.getQuestionById(params.id)

      if (!question) {
        set.status = 404
        return { error: "Question not found", code: "NOT_FOUND" }
      }

      return question
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        tags: ["Questions"],
        summary: "Get question by ID",
        description: "Get a single question with all answer options",
      },
      response: {
        200: QuestionWithOptionsSchema,
        404: ErrorResponseSchema,
      },
    }
  )

  /**
   * POST /api/questions - Create new question with options
   */
  .post(
    "/",
    async ({ body }) => {
      const question = await questionService.createQuestion(body)
      return question
    },
    {
      body: CreateQuestionSchema,
      detail: {
        tags: ["Questions"],
        summary: "Create question",
        description: "Create a new question with optional answer options",
      },
      response: { 200: QuestionWithOptionsSchema },
    }
  )

  /**
   * PATCH /api/questions/:id - Update question
   */
  .patch(
    "/:id",
    async ({ params, body, set }) => {
      const exists = await questionService.questionExists(params.id)
      if (!exists) {
        set.status = 404
        return { error: "Question not found", code: "NOT_FOUND" }
      }

      const question = await questionService.updateQuestion(params.id, body)
      return question
    },
    {
      params: t.Object({ id: t.String() }),
      body: UpdateQuestionSchema,
      detail: {
        tags: ["Questions"],
        summary: "Update question",
      },
      response: {
        200: QuestionSchema,
        404: ErrorResponseSchema,
      },
    }
  )

  /**
   * DELETE /api/questions/:id - Delete question
   */
  .delete(
    "/:id",
    async ({ params, set }) => {
      const exists = await questionService.questionExists(params.id)
      if (!exists) {
        set.status = 404
        return { error: "Question not found", code: "NOT_FOUND" }
      }

      await questionService.deleteQuestion(params.id)
      return { success: true, message: "Question deleted successfully" }
    },
    {
      params: t.Object({ id: t.String() }),
      response: {
        200: SuccessResponseSchema,
        404: ErrorResponseSchema,
      },
      detail: {
        tags: ["Questions"],
        summary: "Delete question",
      },
    }
  )

  // Answer Options nested routes

  /**
   * POST /api/questions/:id/options - Create answer option
   */
  .post(
    "/:id/options",
    async ({ params, body, set }) => {
      const exists = await questionService.questionExists(params.id)
      if (!exists) {
        set.status = 404
        return { error: "Question not found", code: "NOT_FOUND" }
      }

      const option = await questionService.createAnswerOption(params.id, body)
      return option
    },
    {
      params: t.Object({ id: t.String() }),
      body: CreateAnswerOptionSchema,
      detail: {
        tags: ["Questions"],
        summary: "Create answer option",
      },
      response: {
        200: AnswerOptionSchema,
        404: ErrorResponseSchema,
      },
    }
  )

  /**
   * PATCH /api/questions/:id/options/:optionId - Update answer option
   */
  .patch(
    "/:id/options/:optionId",
    async ({ params, body }) => {
      const option = await questionService.updateAnswerOption(
        params.optionId,
        body
      )
      return option
    },
    {
      params: t.Object({
        id: t.String(),
        optionId: t.String(),
      }),
      body: UpdateAnswerOptionSchema,
      detail: {
        tags: ["Questions"],
        summary: "Update answer option",
      },
      response: { 200: AnswerOptionSchema },
    }
  )

  /**
   * DELETE /api/questions/:id/options/:optionId - Delete answer option
   */
  .delete(
    "/:id/options/:optionId",
    async ({ params }) => {
      await questionService.deleteAnswerOption(params.optionId)
      return { success: true, message: "Answer option deleted successfully" }
    },
    {
      params: t.Object({
        id: t.String(),
        optionId: t.String(),
      }),
      response: { 200: SuccessResponseSchema },
      detail: {
        tags: ["Questions"],
        summary: "Delete answer option",
      },
    }
  )
