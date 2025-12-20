/**
 * Stories API routes
 */
import { Elysia, t } from "elysia"
import {
  SuccessResponseSchema,
  ErrorResponseSchema,
} from "../../lib/utils/schemas"
import {
  StoryQuerySchema,
  CreateStorySchema,
  UpdateStorySchema,
  PaginatedStoriesSchema,
  StoryWithSlidesSchema,
  StorySchema,
  CreateStaticSlideSchema,
  CreateInteractiveSlideSchema,
  StaticSlideSchema,
  InteractiveSlideSchema,
} from "./schema"
import * as storyService from "./service"

export const storyRoutes = new Elysia({ prefix: "/stories" })
  /**
   * GET /api/stories - List all stories (paginated)
   */
  .get(
    "/",
    async ({ query }) => {
      const { cursor, limit, sortBy, sortOrder, search, islandId, storyType } =
        query

      const result = await storyService.getStories(
        { cursor, limit, sortBy, sortOrder },
        { search, islandId, storyType }
      )

      return result
    },
    {
      query: StoryQuerySchema,
      response: { 200: PaginatedStoriesSchema },
      detail: {
        tags: ["Stories"],
        summary: "List all stories",
        description: "Get a paginated list of stories with optional filtering",
      },
    }
  )

  /**
   * GET /api/stories/:id - Get single story with slides
   */
  .get(
    "/:id",
    async ({ params, set }) => {
      const story = await storyService.getStoryById(params.id)

      if (!story) {
        set.status = 404
        return { error: "Story not found", code: "NOT_FOUND" }
      }

      return story
    },
    {
      params: t.Object({ id: t.String() }),
      response: {
        200: StoryWithSlidesSchema,
        404: ErrorResponseSchema,
      },
      detail: {
        tags: ["Stories"],
        summary: "Get story by ID",
        description: "Get a single story with all slides",
      },
    }
  )

  /**
   * POST /api/stories - Create new story
   */
  .post(
    "/",
    async ({ body }) => {
      const story = await storyService.createStory(body)
      return story
    },
    {
      body: CreateStorySchema,
      response: { 200: StorySchema },
      detail: {
        tags: ["Stories"],
        summary: "Create story",
      },
    }
  )

  /**
   * PATCH /api/stories/:id - Update story
   */
  .patch(
    "/:id",
    async ({ params, body, set }) => {
      const exists = await storyService.storyExists(params.id)
      if (!exists) {
        set.status = 404
        return { error: "Story not found", code: "NOT_FOUND" }
      }

      const story = await storyService.updateStory(params.id, body)
      return story
    },
    {
      params: t.Object({ id: t.String() }),
      body: UpdateStorySchema,
      response: {
        200: StorySchema,
        404: ErrorResponseSchema,
      },
      detail: {
        tags: ["Stories"],
        summary: "Update story",
      },
    }
  )

  /**
   * DELETE /api/stories/:id - Delete story
   */
  .delete(
    "/:id",
    async ({ params, set }) => {
      const exists = await storyService.storyExists(params.id)
      if (!exists) {
        set.status = 404
        return { error: "Story not found", code: "NOT_FOUND" }
      }

      await storyService.deleteStory(params.id)
      return { success: true, message: "Story deleted successfully" }
    },
    {
      params: t.Object({ id: t.String() }),
      response: {
        200: SuccessResponseSchema,
        404: ErrorResponseSchema,
      },
      detail: {
        tags: ["Stories"],
        summary: "Delete story",
      },
    }
  )

  // Static Slides nested routes

  /**
   * POST /api/stories/:id/static-slides - Create static slide
   */
  .post(
    "/:id/static-slides",
    async ({ params, body, set }) => {
      const exists = await storyService.storyExists(params.id)
      if (!exists) {
        set.status = 404
        return { error: "Story not found", code: "NOT_FOUND" }
      }

      const slide = await storyService.createStaticSlide(params.id, body)
      return slide
    },
    {
      params: t.Object({ id: t.String() }),
      body: CreateStaticSlideSchema,
      response: {
        200: StaticSlideSchema,
        404: ErrorResponseSchema,
      },
      detail: {
        tags: ["Stories"],
        summary: "Create static slide",
      },
    }
  )

  /**
   * POST /api/stories/:id/interactive-slides - Create interactive slide
   */
  .post(
    "/:id/interactive-slides",
    async ({ params, body, set }) => {
      const exists = await storyService.storyExists(params.id)
      if (!exists) {
        set.status = 404
        return { error: "Story not found", code: "NOT_FOUND" }
      }

      const slide = await storyService.createInteractiveSlide(params.id, body)
      return slide
    },
    {
      params: t.Object({ id: t.String() }),
      body: CreateInteractiveSlideSchema,
      response: {
        200: InteractiveSlideSchema,
        404: ErrorResponseSchema,
      },
      detail: {
        tags: ["Stories"],
        summary: "Create interactive slide",
      },
    }
  )
