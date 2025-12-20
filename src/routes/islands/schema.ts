/**
 * TypeBox validation schemas for Islands domain
 */
import { t } from "elysia"
import {
  createPaginatedSchema,
  PaginationQuerySchema,
} from "../../lib/utils/schemas"

// Base Island schema
export const IslandSchema = t.Object({
  id: t.String(),
  islandName: t.String(),
  unlockOrder: t.Number(),
  isLockedDefault: t.Boolean(),
})

// Island with relations
export const IslandWithStoriesSchema = t.Object({
  ...IslandSchema.properties,
  stories: t.Optional(
    t.Array(
      t.Object({
        id: t.String(),
        title: t.String(),
        storyType: t.Union([t.Literal("STATIC"), t.Literal("INTERACTIVE")]),
      })
    )
  ),
  _count: t.Optional(
    t.Object({
      stories: t.Number(),
      userProgress: t.Number(),
    })
  ),
})

// Create Island input
export const CreateIslandSchema = t.Object({
  islandName: t.String({ minLength: 1, maxLength: 100 }),
  unlockOrder: t.Number({ minimum: 0 }),
  isLockedDefault: t.Optional(t.Boolean({ default: true })),
})

// Update Island input
export const UpdateIslandSchema = t.Partial(CreateIslandSchema)

// Island list query params
export const IslandQuerySchema = t.Composite([
  PaginationQuerySchema,
  t.Object({
    isLockedDefault: t.Optional(t.Boolean()),
  }),
])

// Paginated Islands response
export const PaginatedIslandsSchema = createPaginatedSchema(IslandSchema)
