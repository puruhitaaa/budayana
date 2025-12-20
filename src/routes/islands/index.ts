/**
 * Islands API routes
 */
import { Elysia, t } from "elysia"
import {
  SuccessResponseSchema,
  ErrorResponseSchema,
} from "../../lib/utils/schemas"
import {
  IslandQuerySchema,
  CreateIslandSchema,
  UpdateIslandSchema,
  PaginatedIslandsSchema,
  IslandWithStoriesSchema,
  IslandSchema,
} from "./schema"
import * as islandService from "./service"

export const islandRoutes = new Elysia({ prefix: "/islands" })
  /**
   * GET /api/islands - List all islands (paginated)
   */
  .get(
    "/",
    async ({ query }) => {
      const { cursor, limit, sortBy, sortOrder, search, isLockedDefault } =
        query

      const result = await islandService.getIslands(
        { cursor, limit, sortBy, sortOrder },
        { search, isLockedDefault }
      )

      return result
    },
    {
      query: IslandQuerySchema,
      response: {
        200: PaginatedIslandsSchema,
      },
      detail: {
        tags: ["Islands"],
        summary: "List all islands",
        description:
          "Get a paginated list of islands with optional filtering and sorting",
      },
    }
  )

  /**
   * GET /api/islands/:id - Get single island with stories
   */
  .get(
    "/:id",
    async ({ params, query, set }) => {
      const includeStories = query.includeStories === "true"
      const island = await islandService.getIslandById(
        params.id,
        includeStories
      )

      if (!island) {
        set.status = 404
        return { error: "Island not found", code: "NOT_FOUND" }
      }

      return island
    },
    {
      params: t.Object({ id: t.String() }),
      query: t.Object({
        includeStories: t.Optional(t.String()),
      }),
      response: {
        200: IslandWithStoriesSchema,
        404: ErrorResponseSchema,
      },
      detail: {
        tags: ["Islands"],
        summary: "Get island by ID",
        description: "Get a single island with optional story list",
      },
    }
  )

  /**
   * POST /api/islands - Create new island
   */
  .post(
    "/",
    async ({ body }) => {
      const island = await islandService.createIsland(body)
      return island
    },
    {
      body: CreateIslandSchema,
      response: {
        200: IslandSchema,
      },
      detail: {
        tags: ["Islands"],
        summary: "Create island",
        description: "Create a new island",
      },
    }
  )

  /**
   * PATCH /api/islands/:id - Update island
   */
  .patch(
    "/:id",
    async ({ params, body, set }) => {
      const exists = await islandService.islandExists(params.id)
      if (!exists) {
        set.status = 404
        return { error: "Island not found", code: "NOT_FOUND" }
      }

      const island = await islandService.updateIsland(params.id, body)
      return island
    },
    {
      params: t.Object({ id: t.String() }),
      body: UpdateIslandSchema,
      response: {
        200: IslandSchema,
        404: ErrorResponseSchema,
      },
      detail: {
        tags: ["Islands"],
        summary: "Update island",
        description: "Update an existing island",
      },
    }
  )

  /**
   * DELETE /api/islands/:id - Delete island
   */
  .delete(
    "/:id",
    async ({ params, set }) => {
      const exists = await islandService.islandExists(params.id)
      if (!exists) {
        set.status = 404
        return { error: "Island not found", code: "NOT_FOUND" }
      }

      await islandService.deleteIsland(params.id)
      return { success: true, message: "Island deleted successfully" }
    },
    {
      params: t.Object({ id: t.String() }),
      response: {
        200: SuccessResponseSchema,
        404: ErrorResponseSchema,
      },
      detail: {
        tags: ["Islands"],
        summary: "Delete island",
        description: "Delete an island and all related data",
      },
    }
  )
