/**
 * Service layer for Stories domain
 */
import type {
  Story,
  StoryType,
  SlideType,
} from "../../lib/db/prisma/generated/client"
import prisma from "../../lib/db"
import {
  paginatedQuery,
  type PaginationParams,
  type PaginatedResult,
  buildWhereClause,
  buildSearchFilter,
  combineWhereClauses,
} from "../../lib/utils"

export interface StoryFilters {
  islandId?: string
  storyType?: StoryType
  search?: string
}

const ALLOWED_SORT_FIELDS = ["title", "id"]
const SEARCH_FIELDS = ["title"]

/**
 * Get paginated list of stories
 */
export async function getStories(
  pagination: PaginationParams,
  filters: StoryFilters = {}
): Promise<PaginatedResult<Story>> {
  const filterClause = buildWhereClause(
    { islandId: filters.islandId, storyType: filters.storyType },
    ["islandId", "storyType"]
  )
  const searchClause = buildSearchFilter(filters.search, SEARCH_FIELDS)
  const where = combineWhereClauses(filterClause, searchClause)

  return paginatedQuery(
    (options) =>
      prisma.story.findMany({
        ...options,
        where,
      }),
    pagination,
    {
      allowedSortFields: ALLOWED_SORT_FIELDS,
      defaultSortField: "title",
    }
  )
}

/**
 * Get single story by ID with slides
 */
export async function getStoryById(id: string, includeSlides = true) {
  return prisma.story.findUnique({
    where: { id },
    include: {
      staticSlides: includeSlides ? { orderBy: { slideNumber: "asc" } } : false,
      interactiveSlides: includeSlides
        ? { orderBy: { slideNumber: "asc" } }
        : false,
      _count: {
        select: {
          questions: true,
          storyAttempts: true,
        },
      },
    },
  })
}

/**
 * Create a new story
 */
export async function createStory(data: {
  islandId: string
  title: string
  storyType: StoryType
}) {
  return prisma.story.create({
    data,
  })
}

/**
 * Update a story
 */
export async function updateStory(
  id: string,
  data: {
    title?: string
    storyType?: StoryType
  }
) {
  return prisma.story.update({
    where: { id },
    data,
  })
}

/**
 * Delete a story
 */
export async function deleteStory(id: string) {
  return prisma.story.delete({
    where: { id },
  })
}

/**
 * Check if story exists
 */
export async function storyExists(id: string): Promise<boolean> {
  const count = await prisma.story.count({ where: { id } })
  return count > 0
}

// Static Slides operations

/**
 * Create static slide
 */
export async function createStaticSlide(
  storyId: string,
  data: {
    slideNumber: number
    contentText?: string
    imageUrl?: string
  }
) {
  return prisma.staticSlide.create({
    data: {
      storyId,
      slideNumber: data.slideNumber,
      contentText: data.contentText,
      imageUrl: data.imageUrl,
    },
  })
}

/**
 * Update static slide
 */
export async function updateStaticSlide(
  id: string,
  data: {
    slideNumber?: number
    contentText?: string
    imageUrl?: string
  }
) {
  return prisma.staticSlide.update({
    where: { id },
    data,
  })
}

/**
 * Delete static slide
 */
export async function deleteStaticSlide(id: string) {
  return prisma.staticSlide.delete({
    where: { id },
  })
}

// Interactive Slides operations

/**
 * Create interactive slide
 */
export async function createInteractiveSlide(
  storyId: string,
  data: {
    questionId?: string
    slideNumber: number
    slideType: SlideType
    imageUrl?: string
    contentText?: string
  }
) {
  return prisma.interactiveSlide.create({
    data: {
      storyId,
      ...data,
    },
  })
}

/**
 * Update interactive slide
 */
export async function updateInteractiveSlide(
  id: string,
  data: {
    questionId?: string
    slideNumber?: number
    slideType?: SlideType
    imageUrl?: string
    contentText?: string
  }
) {
  return prisma.interactiveSlide.update({
    where: { id },
    data,
  })
}

/**
 * Delete interactive slide
 */
export async function deleteInteractiveSlide(id: string) {
  return prisma.interactiveSlide.delete({
    where: { id },
  })
}
