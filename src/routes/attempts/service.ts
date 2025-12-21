/**
 * Service layer for Attempts domain
 */
import type {
  StoryAttempt,
  AttemptStageType,
} from "../../lib/db/prisma/generated/client"
import prisma from "../../lib/db"
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
function transformAttempt(attempt: StoryAttempt) {
  return {
    ...attempt,
    preTestScore: toNumber(attempt.preTestScore),
    postTestScore: toNumber(attempt.postTestScore),
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
  })

  if (existingAttempt) {
    return transformAttempt(existingAttempt)
  }

  const attempt = await prisma.storyAttempt.create({
    data: {
      userId,
      storyId,
    },
  })
  return transformAttempt(attempt)
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

  return {
    ...stage,
    score: toNumber(stage.score),
  }
}

// Question Attempt Logs

/**
 * Create question attempt log
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

  // If selectedOptionId is provided, verify it against the database
  if (data.selectedOptionId) {
    const selectedOption = await prisma.answerOption.findUnique({
      where: { id: data.selectedOptionId },
    })

    // Verify the option belongs to the question and check correctness
    if (selectedOption && selectedOption.questionId === data.questionId) {
      isCorrect = selectedOption.isCorrect
      // Auto-fill text if not provided
      if (!userAnswerText) {
        userAnswerText = selectedOption.optionText
      }
    }
  }

  return prisma.questionAttemptLog.create({
    data: {
      attemptId,
      questionId: data.questionId,
      userAnswerText: userAnswerText,
      isCorrect: isCorrect,
      attemptCount: data.attemptCount ?? 1,
    },
  })
}
