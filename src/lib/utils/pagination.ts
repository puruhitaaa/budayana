/**
 * Cursor-based pagination utilities for Prisma queries
 * Provides production-ready pagination with consistent cursor encoding
 */

export interface PaginationParams {
  cursor?: string
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface PaginatedResult<T> {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
  totalCount?: number
}

interface CursorData {
  id: string
  sortValue?: string | number | Date
}

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

/**
 * Encode cursor data to base64 string
 */
export function encodeCursor(data: CursorData): string {
  return Buffer.from(JSON.stringify(data)).toString("base64url")
}

/**
 * Decode base64 cursor string to cursor data
 */
export function decodeCursor(cursor: string): CursorData | null {
  try {
    const decoded = Buffer.from(cursor, "base64url").toString("utf-8")
    return JSON.parse(decoded) as CursorData
  } catch {
    return null
  }
}

/**
 * Normalize limit value within bounds
 */
export function normalizeLimit(limit?: number): number {
  if (!limit || limit < 1) return DEFAULT_LIMIT
  if (limit > MAX_LIMIT) return MAX_LIMIT
  return limit
}

/**
 * Build Prisma cursor pagination query options
 */
export function buildCursorQuery<T extends { id: string }>(
  params: PaginationParams,
  allowedSortFields: string[] = ["createdAt"],
  defaultSortField = "createdAt"
): {
  take: number
  skip: number
  cursor: { id: string } | undefined
  orderBy: Record<string, "asc" | "desc">[]
} {
  const limit = normalizeLimit(params.limit)
  const sortField = allowedSortFields.includes(params.sortBy || "")
    ? params.sortBy!
    : defaultSortField
  const sortOrder = params.sortOrder || "desc"

  let cursor: { id: string } | undefined
  let skip = 0

  if (params.cursor) {
    const decoded = decodeCursor(params.cursor)
    if (decoded) {
      cursor = { id: decoded.id }
      skip = 1 // Skip the cursor item itself
    }
  }

  // Always include id in orderBy for consistent cursor behavior
  const orderBy: Record<string, "asc" | "desc">[] = []
  if (sortField !== "id") {
    orderBy.push({ [sortField]: sortOrder })
  }
  orderBy.push({ id: sortOrder })

  return {
    take: limit + 1, // Fetch one extra to check hasMore
    skip,
    cursor,
    orderBy,
  }
}

/**
 * Process query results into paginated response
 */
export function processPaginatedResult<T extends { id: string }>(
  items: T[],
  limit: number,
  sortField = "createdAt"
): PaginatedResult<T> {
  const hasMore = items.length > limit
  const resultItems = hasMore ? items.slice(0, limit) : items

  let nextCursor: string | null = null
  if (hasMore && resultItems.length > 0) {
    const lastItem = resultItems[resultItems.length - 1]
    const sortValue = (lastItem as Record<string, unknown>)[sortField]
    nextCursor = encodeCursor({
      id: lastItem.id,
      sortValue: sortValue as string | number | Date,
    })
  }

  return {
    items: resultItems,
    nextCursor,
    hasMore,
  }
}

/**
 * Helper to create a complete paginated query and process results
 */
export async function paginatedQuery<T extends { id: string }>(
  queryFn: (options: {
    take: number
    skip: number
    cursor: { id: string } | undefined
    orderBy: Record<string, "asc" | "desc">[]
  }) => Promise<T[]>,
  params: PaginationParams,
  options: {
    allowedSortFields?: string[]
    defaultSortField?: string
    includeCount?: boolean
    countFn?: () => Promise<number>
  } = {}
): Promise<PaginatedResult<T>> {
  const {
    allowedSortFields = ["createdAt"],
    defaultSortField = "createdAt",
    includeCount = false,
    countFn,
  } = options

  const limit = normalizeLimit(params.limit)
  const queryOptions = buildCursorQuery(
    params,
    allowedSortFields,
    defaultSortField
  )

  const items = await queryFn(queryOptions)
  const result = processPaginatedResult(
    items,
    limit,
    params.sortBy || defaultSortField
  )

  if (includeCount && countFn) {
    result.totalCount = await countFn()
  }

  return result
}
