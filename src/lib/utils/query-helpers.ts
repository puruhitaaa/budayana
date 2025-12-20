/**
 * Query helper utilities for filtering and sorting Prisma queries
 */

export type SortOrder = "asc" | "desc"

export interface FilterValue {
  equals?: unknown
  contains?: string
  startsWith?: string
  endsWith?: string
  gt?: number | Date | string
  gte?: number | Date | string
  lt?: number | Date | string
  lte?: number | Date | string
  in?: unknown[]
  not?: unknown
}

/**
 * Parse filter operators from query string value
 * Supports: field_gt, field_gte, field_lt, field_lte, field_contains, etc.
 */
export function parseFilterValue(value: string): FilterValue | unknown {
  // Handle comma-separated values as "in" operator
  if (value.includes(",")) {
    return { in: value.split(",").map((v) => v.trim()) }
  }
  return value
}

/**
 * Build Prisma where clause from query parameters
 * Only includes fields that are in the allowedFields list
 */
export function buildWhereClause<T extends Record<string, unknown>>(
  filters: Record<string, unknown>,
  allowedFields: string[]
): Partial<T> {
  const where: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") continue

    // Parse field name and operator (e.g., "score_gte" -> ["score", "gte"])
    const parts = key.split("_")
    const operator = parts.length > 1 ? parts.pop() : null
    const fieldName = parts.join("_")

    if (!allowedFields.includes(fieldName)) continue

    const stringValue = String(value)

    // Handle operators
    if (
      operator &&
      ["gt", "gte", "lt", "lte", "contains", "startsWith", "endsWith"].includes(
        operator
      )
    ) {
      where[fieldName] = {
        ...((where[fieldName] as Record<string, unknown>) || {}),
        [operator]: isNumericOperator(operator)
          ? parseNumber(stringValue)
          : stringValue,
      }
    } else if (!operator) {
      // Direct equality or "in" for comma-separated
      where[fieldName] = parseFilterValue(stringValue)
    }
  }

  return where as Partial<T>
}

/**
 * Build Prisma orderBy from sort parameters
 */
export function buildOrderBy(
  sortBy: string | undefined,
  sortOrder: SortOrder = "desc",
  allowedFields: string[],
  defaultField = "createdAt"
): Record<string, SortOrder> {
  const field = sortBy && allowedFields.includes(sortBy) ? sortBy : defaultField
  return { [field]: sortOrder }
}

/**
 * Build search filter for text fields
 * Searches across multiple fields with OR condition
 */
export function buildSearchFilter(
  search: string | undefined,
  searchFields: string[]
):
  | { OR: Record<string, { contains: string; mode: "insensitive" }>[] }
  | undefined {
  if (!search || search.trim() === "" || searchFields.length === 0) {
    return undefined
  }

  const searchTerm = search.trim()

  return {
    OR: searchFields.map((field) => ({
      [field]: {
        contains: searchTerm,
        mode: "insensitive" as const,
      },
    })),
  }
}

/**
 * Combine multiple where clauses with AND
 */
export function combineWhereClauses<T extends Record<string, unknown>>(
  ...clauses: (Partial<T> | undefined)[]
): Partial<T> {
  const validClauses = clauses.filter(
    (c): c is Partial<T> => c !== undefined && Object.keys(c).length > 0
  )

  if (validClauses.length === 0) return {} as Partial<T>
  if (validClauses.length === 1) return validClauses[0]

  // Merge all clauses into one object
  return Object.assign({}, ...validClauses) as Partial<T>
}

// Helper functions
function isNumericOperator(op: string): boolean {
  return ["gt", "gte", "lt", "lte"].includes(op)
}

function parseNumber(value: string): number | string {
  const num = Number(value)
  return Number.isNaN(num) ? value : num
}
