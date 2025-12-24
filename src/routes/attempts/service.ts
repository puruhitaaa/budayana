/**
 * Service layer for Attempts domain
 */
import type {
  StoryAttempt,
  AttemptStageType,
} from "../../lib/db/prisma/generated/client"
import prisma from "../../lib/db"
import * as progressService from "../progress/service"
import {
  paginatedQuery,
  type PaginationParams,
  type PaginatedResult,
  buildWhereClause,
  combineWhereClauses,
} from "../../lib/utils"

export interface AttemptFilters {
  userId?: string
  storyId?: string
  islandId?: string
  isFinished?: boolean
}

const ALLOWED_SORT_FIELDS = ["startedAt", "finishedAt", "totalXpGained", "id"]

/**
 * Get paginated list of story attempts
 */
// Helper to safely convert Decimal to number
function toNumber(val: any): number | null {
  if (val === null || val === undefined) return null
  return typeof val.toNumber === "function" ? val.toNumber() : Number(val)
}

// Helper to transform attempt result
function transformAttempt(
  attempt: StoryAttempt & { story?: { title: string } }
) {
  return {
    ...attempt,
    preTestScore: toNumber(attempt.preTestScore),
    postTestScore: toNumber(attempt.postTestScore),
    story: attempt.story,
  }
}

/**
 * Get paginated list of story attempts
 */
export async function getAttempts(
  pagination: PaginationParams,
  filters: AttemptFilters = {}
): Promise<PaginatedResult<ReturnType<typeof transformAttempt>>> {
  const filterClause = buildWhereClause(
    {
      userId: filters.userId,
      storyId: filters.storyId,
    },
    ["userId", "storyId"]
  )

  // Handle isFinished filter
  const finishedClause =
    filters.isFinished !== undefined
      ? { finishedAt: filters.isFinished ? { not: null } : null }
      : undefined

  // Handle islandId filter (via relation)
  const islandClause = filters.islandId
    ? { story: { islandId: filters.islandId } }
    : undefined

  const where = combineWhereClauses(
    combineWhereClauses(filterClause, finishedClause),
    islandClause
  )

  const result = await paginatedQuery(
    (options) =>
      prisma.storyAttempt.findMany({
        ...options,
        where,
        include: {
          story: {
            select: {
              title: true,
            },
          },
        },
      }),
    pagination,
    {
      allowedSortFields: ALLOWED_SORT_FIELDS,
      defaultSortField: "startedAt",
    }
  )

  return {
    ...result,
    items: result.items.map(transformAttempt),
  }
}

/**
 * Get single attempt by ID with details
 */
export async function getAttemptById(id: string) {
  const attempt = await prisma.storyAttempt.findUnique({
    where: { id },
    include: {
      stageAttempts: {
        orderBy: { id: "asc" },
      },
      questionLogs: {
        orderBy: { answeredAt: "asc" },
      },
    },
  })

  if (!attempt) return null

  return {
    ...transformAttempt(attempt),
    stageAttempts: attempt.stageAttempts.map((stage) => ({
      ...stage,
      score: toNumber(stage.score),
    })),
    questionLogs: attempt.questionLogs,
  }
}

/**
 * Create a new story attempt or resume an existing unfinished one
 */
export async function createAttempt(userId: string, storyId: string) {
  // Check for existing unfinished attempt
  const existingAttempt = await prisma.storyAttempt.findFirst({
    where: {
      userId,
      storyId,
      finishedAt: null,
    },
    include: {
      questionLogs: {
        orderBy: { answeredAt: "asc" },
      },
    },
  })

  if (existingAttempt) {
    return {
      ...transformAttempt(existingAttempt),
      questionLogs: existingAttempt.questionLogs,
    }
  }

  const attempt = await prisma.storyAttempt.create({
    data: {
      userId,
      storyId,
    },
  })
  return {
    ...transformAttempt(attempt),
    questionLogs: [],
  }
}

/**
 * Update a story attempt
 */
export async function updateAttempt(
  id: string,
  data: {
    finishedAt?: Date
    totalTimeSeconds?: number
    totalXpGained?: number
    preTestScore?: number
    postTestScore?: number
    correctInteractiveCnt?: number
    wrongInteractiveCnt?: number
    essayAnswer?: string
  }
) {
  // If totalXpGained is set, increment the user's totalXp
  if (data.totalXpGained && data.totalXpGained > 0) {
    const attemptForXp = await prisma.storyAttempt.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (attemptForXp) {
      await prisma.user.update({
        where: { id: attemptForXp.userId },
        data: { totalXp: { increment: data.totalXpGained } },
      })
    }
  }

  const attempt = await prisma.storyAttempt.update({
    where: { id },
    data,
  })
  return transformAttempt(attempt)
}

/**
 * Delete a story attempt
 */
export async function deleteAttempt(id: string) {
  return prisma.storyAttempt.delete({
    where: { id },
  })
}

/**
 * Check if attempt exists
 */
export async function attemptExists(id: string): Promise<boolean> {
  const count = await prisma.storyAttempt.count({ where: { id } })
  return count > 0
}

/**
 * Check if attempt belongs to user
 */
export async function attemptBelongsToUser(
  id: string,
  userId: string
): Promise<boolean> {
  const count = await prisma.storyAttempt.count({
    where: { id, userId },
  })
  return count > 0
}

// Stage Attempts

/**
 * Create stage attempt
 */
export async function createStageAttempt(
  attemptId: string,
  data: {
    stageType: AttemptStageType
    timeSpentSeconds?: number
    xpGained?: number
    score?: number
  }
) {
  // Calculate score server-side if not provided
  let calculatedScore = data.score

  if (calculatedScore === undefined) {
    // Fetch all question logs for this attempt
    const logs = await prisma.questionAttemptLog.findMany({
      where: {
        attemptId,
        question: {
          stageType:
            data.stageType === "STORY" ? "INTERACTIVE" : data.stageType,
        },
      },
      include: {
        question: true,
      },
    })

    if (logs.length > 0) {
      const correctCount = logs.filter((log) => log.isCorrect).length
      // Simple percentage score: (correct / total) * 100
      calculatedScore = (correctCount / logs.length) * 100
    } else {
      calculatedScore = 0
    }
  }

  const stage = await prisma.stageAttempt.create({
    data: {
      attemptId,
      stageType: data.stageType,
      timeSpentSeconds: data.timeSpentSeconds ?? 0,
      xpGained: data.xpGained ?? 0,
      score: calculatedScore,
    },
  })

  // Automatically update the parent StoryAttempt with the score
  if (data.stageType === "PRE_TEST") {
    await prisma.storyAttempt.update({
      where: { id: attemptId },
      data: { preTestScore: calculatedScore },
    })
  } else if (data.stageType === "POST_TEST") {
    // Get the attempt with story info
    const attempt = await prisma.storyAttempt.findUnique({
      where: { id: attemptId },
      include: { story: true },
    })

    if (attempt) {
      await prisma.storyAttempt.update({
        where: { id: attemptId },
        data: { postTestScore: calculatedScore },
      })

      // Check if cycle is complete and increment count
      const isCycleComplete = await checkCycleCompletion(
        attempt.userId,
        attempt.story.islandId
      )

      if (isCycleComplete) {
        await progressService.incrementCycleCount(
          attempt.userId,
          attempt.story.islandId
        )
      }
    }
  }

  // Increment user's totalXp when xpGained > 0
  const xpToAdd = data.xpGained ?? 0
  if (xpToAdd > 0) {
    const attemptForXp = await prisma.storyAttempt.findUnique({
      where: { id: attemptId },
      select: { userId: true },
    })

    if (attemptForXp) {
      await prisma.user.update({
        where: { id: attemptForXp.userId },
        data: { totalXp: { increment: xpToAdd } },
      })
    }
  }

  return {
    ...stage,
    score: toNumber(stage.score),
  }
}

// Question Attempt Logs

/**
 * Create question attempt log
 * SECURITY: Server-side answer validation - client cannot spoof correctness
 */
export async function createQuestionLog(
  attemptId: string,
  data: {
    questionId: string
    selectedOptionId?: string
    userAnswerText?: string
    isCorrect?: boolean
    attemptCount?: number
  }
) {
  let isCorrect = data.isCorrect
  let userAnswerText = data.userAnswerText

  // Fetch question to determine type and validation logic
  const question = await prisma.question.findUnique({
    where: { id: data.questionId },
    include: {
      answerOptions: true,
    },
  })

  if (!question) {
    throw new Error(`Question not found: ${data.questionId}`)
  }

  // Handle MCQ and TRUE_FALSE via selectedOptionId
  if (data.selectedOptionId) {
    const selectedOption = await prisma.answerOption.findUnique({
      where: { id: data.selectedOptionId },
    })

    // SECURITY: Reject invalid option IDs
    if (!selectedOption) {
      throw new Error(`Invalid answer option ID: ${data.selectedOptionId}`)
    }

    // SECURITY: Verify the option belongs to the question
    if (selectedOption.questionId !== data.questionId) {
      throw new Error(
        `Answer option ${data.selectedOptionId} does not belong to question ${data.questionId}`
      )
    }

    // Server-side correctness check (client cannot spoof this)
    isCorrect = selectedOption.isCorrect

    // Auto-fill text if not provided
    if (!userAnswerText) {
      userAnswerText = selectedOption.optionText
    }
  }
  // Handle DRAG_DROP validation
  else if (question.questionType === "DRAG_DROP" && userAnswerText) {
    try {
      const metadata = question.metadata as {
        items: Array<{ id: string; label: string }>
        correctOrder: string[]
      }

      if (!metadata?.correctOrder) {
        throw new Error(
          `Question ${data.questionId} is DRAG_DROP but missing correctOrder in metadata`
        )
      }

      // Parse user's answer (expecting JSON array of IDs)
      const userOrder = JSON.parse(userAnswerText)

      if (!Array.isArray(userOrder)) {
        throw new Error("DRAG_DROP answer must be a JSON array of item IDs")
      }

      // Validate order matches correctOrder exactly
      isCorrect =
        userOrder.length === metadata.correctOrder.length &&
        userOrder.every((id, index) => id === metadata.correctOrder[index])
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error("Invalid JSON format for DRAG_DROP answer")
      }
      throw error
    }
  }

  return prisma.questionAttemptLog.create({
    data: {
      attemptId,
      questionId: data.questionId,
      userAnswerText: userAnswerText,
      isCorrect: isCorrect ?? false, // Default to false if no validation occurred
      attemptCount: data.attemptCount ?? 1,
    },
  })
}

/**
 * Check if a user has completed all trackable stories in an island
 * Used to determine if a cycle is complete
 */
async function checkCycleCompletion(
  userId: string,
  islandId: string
): Promise<boolean> {
  // Get all stories in the island with their content
  const stories = await prisma.story.findMany({
    where: { islandId },
    include: {
      staticSlides: { take: 1 },
      interactiveSlides: { take: 1 },
    },
  })

  // Filter trackable stories
  const trackableStoryIds = stories
    .filter((story) => {
      // Only track stories that have actual content (slides)
      // This prevents empty "ghost" stories or placeholder pre/post tests from blocking cycle completion
      const hasContent =
        (story.storyType === "STATIC" && story.staticSlides.length > 0) ||
        (story.storyType === "INTERACTIVE" &&
          story.interactiveSlides.length > 0)

      return hasContent
    })
    .map((s) => s.id)

  if (trackableStoryIds.length === 0) return false

  // Check if each trackable story has a finished attempt
  // Use findMany with distinct to ensure we count unique stories, not just total attempts
  const finishedAttempts = await prisma.storyAttempt.findMany({
    where: {
      userId,
      storyId: { in: trackableStoryIds },
      finishedAt: { not: null },
    },
    select: {
      storyId: true,
    },
    distinct: ["storyId"],
  })

  return finishedAttempts.length >= trackableStoryIds.length
}
