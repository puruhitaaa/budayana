/**
 * TypeBox validation schemas for User Progress domain
 */
import { t } from "elysia"
import {
  createPaginatedSchema,
  PaginationQuerySchema,
} from "../../lib/utils/schemas"

// Base User Progress schema
export const UserProgressSchema = t.Object({
  id: t.String(),
  userId: t.String(),
  islandId: t.String(),
  isUnlocked: t.Boolean(),
  isCompleted: t.Boolean(),
})

// Progress with relations
export const UserProgressWithIslandSchema = t.Object({
  ...UserProgressSchema.properties,
  island: t.Optional(
    t.Object({
      id: t.String(),
      islandName: t.String(),
      unlockOrder: t.Number(),
    })
  ),
})

// Create/Update Progress input
export const UpsertProgressSchema = t.Object({
  islandId: t.String(),
  isUnlocked: t.Optional(t.Boolean()),
  isCompleted: t.Optional(t.Boolean()),
})

// Update Progress input
export const UpdateProgressSchema = t.Object({
  isUnlocked: t.Optional(t.Boolean()),
  isCompleted: t.Optional(t.Boolean()),
})

// Progress list query params
export const ProgressQuerySchema = t.Composite([
  PaginationQuerySchema,
  t.Object({
    isUnlocked: t.Optional(t.Boolean()),
    isCompleted: t.Optional(t.Boolean()),
  }),
])

// Paginated response
export const PaginatedProgressSchema = t.Composite([
  createPaginatedSchema(UserProgressWithIslandSchema),
  t.Object({
    completedStory: t.Integer(),
  }),
])

// Cycle count response
export const CycleCountResponseSchema = t.Object({
  cycleCount: t.Integer(),
})
