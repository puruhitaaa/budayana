/**
 * Service layer for Islands domain
 * Contains all Prisma operations for Island model
 */
import type { Island } from "../../lib/db/prisma/generated/client"
import prisma from "../../lib/db"
import {
  paginatedQuery,
  type PaginationParams,
  type PaginatedResult,
  buildWhereClause,
  buildSearchFilter,
  combineWhereClauses,
} from "../../lib/utils"

export interface IslandFilters {
  isLockedDefault?: boolean
  search?: string
}

const ALLOWED_SORT_FIELDS = ["unlockOrder", "islandName", "id"]
const SEARCH_FIELDS = ["islandName"]

/**
 * Get paginated list of islands
 */
export async function getIslands(
  pagination: PaginationParams,
  filters: IslandFilters = {}
): Promise<PaginatedResult<Island>> {
  const filterClause = buildWhereClause(
    { isLockedDefault: filters.isLockedDefault },
    ["isLockedDefault"]
  )
  const searchClause = buildSearchFilter(filters.search, SEARCH_FIELDS)
  const where = combineWhereClauses(filterClause, searchClause)

  return paginatedQuery(
    (options) =>
      prisma.island.findMany({
        ...options,
        where,
      }),
    pagination,
    {
      allowedSortFields: ALLOWED_SORT_FIELDS,
      defaultSortField: "unlockOrder",
    }
  )
}

/**
 * Get single island by ID with optional relations
 */
export async function getIslandById(id: string, includeStories = false) {
  return prisma.island.findUnique({
    where: { id },
    include: {
      stories: includeStories
        ? {
            select: {
              id: true,
              title: true,
              storyType: true,
              order: true,
            },
            orderBy: { order: "asc" },
          }
        : false,
      _count: {
        select: {
          stories: true,
          userProgress: true,
        },
      },
    },
  })
}

/**
 * Create a new island
 */
export async function createIsland(data: {
  islandName: string
  unlockOrder: number
  isLockedDefault?: boolean
}) {
  return prisma.island.create({
    data: {
      islandName: data.islandName,
      unlockOrder: data.unlockOrder,
      isLockedDefault: data.isLockedDefault ?? true,
    },
  })
}

/**
 * Update an island
 */
export async function updateIsland(
  id: string,
  data: {
    islandName?: string
    unlockOrder?: number
    isLockedDefault?: boolean
  }
) {
  return prisma.island.update({
    where: { id },
    data,
  })
}

/**
 * Delete an island
 */
export async function deleteIsland(id: string) {
  return prisma.island.delete({
    where: { id },
  })
}

/**
 * Check if island exists
 */
export async function islandExists(id: string): Promise<boolean> {
  const count = await prisma.island.count({ where: { id } })
  return count > 0
}
