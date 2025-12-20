/**
 * Shared TypeBox validation schemas for API routes
 */
import { t, type TSchema } from "elysia"

/**
 * Reusable pagination query schema for list endpoints
 */
export const PaginationQuerySchema = t.Object({
  cursor: t.Optional(
    t.String({ description: "Pagination cursor from previous response" })
  ),
  limit: t.Optional(
    t.Number({
      minimum: 1,
      maximum: 100,
      default: 20,
      description: "Number of items per page (1-100)",
    })
  ),
  sortBy: t.Optional(t.String({ description: "Field to sort by" })),
  sortOrder: t.Optional(
    t.Union([t.Literal("asc"), t.Literal("desc")], {
      default: "desc",
      description: "Sort direction",
    })
  ),
  search: t.Optional(t.String({ description: "Search query" })),
})

/**
 * ID path parameter schema
 */
export const IdParamSchema = t.Object({
  id: t.String({ description: "Resource ID" }),
})

/**
 * Create a paginated response schema for a given item schema
 */
export function createPaginatedSchema<T extends TSchema>(itemSchema: T) {
  return t.Object({
    items: t.Array(itemSchema),
    nextCursor: t.Nullable(t.String()),
    hasMore: t.Boolean(),
    totalCount: t.Optional(t.Number()),
  })
}

/**
 * Standard error response schema
 */
export const ErrorResponseSchema = t.Object({
  error: t.String({ description: "Error message" }),
  code: t.Optional(t.String({ description: "Error code" })),
  details: t.Optional(t.Record(t.String(), t.Unknown())),
})

/**
 * Success response with message
 */
export const SuccessResponseSchema = t.Object({
  success: t.Boolean(),
  message: t.Optional(t.String()),
})

/**
 * Timestamp fields common to many models
 */
export const TimestampFieldsSchema = t.Object({
  createdAt: t.Optional(t.Date()),
  updatedAt: t.Optional(t.Date()),
})

// Re-export t for convenience
export { t }
