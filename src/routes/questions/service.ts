/**
 * Service layer for Questions domain
 */
import type {
  Question,
  StageType,
  QuestionType,
  AnswerOption,
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

export interface QuestionFilters {
  storyId?: string
  stageType?: StageType
  questionType?: QuestionType
  search?: string
}

const ALLOWED_SORT_FIELDS = ["xpValue", "questionText", "id"]
const SEARCH_FIELDS = ["questionText"]

/**
 * Get paginated list of questions
 */
export async function getQuestions(
  pagination: PaginationParams,
  filters: QuestionFilters = {},
  publicView: boolean = false
): Promise<
  PaginatedResult<
    Question & {
      answerOptions: AnswerOption[] | Omit<AnswerOption, "isCorrect">[]
    }
  >
> {
  const filterClause = buildWhereClause(
    {
      storyId: filters.storyId,
      stageType: filters.stageType,
      questionType: filters.questionType,
    },
    ["storyId", "stageType", "questionType"]
  )
  const searchClause = buildSearchFilter(filters.search, SEARCH_FIELDS)
  const where = combineWhereClauses(filterClause, searchClause)

  const result = await paginatedQuery(
    (options) =>
      prisma.question.findMany({
        ...options,
        where,
        include: {
          answerOptions: true,
        },
      }),
    pagination,
    {
      allowedSortFields: ALLOWED_SORT_FIELDS,
      defaultSortField: "id",
    }
  )

  if (publicView) {
    return {
      ...result,
      items: result.items.map((q) => ({
        ...q,
        answerOptions: q.answerOptions.map(({ isCorrect, ...rest }) => rest),
      })),
    }
  }

  return result
}

/**
 * Get single question by ID with answer options
 */
export async function getQuestionById(id: string, publicView: boolean = false) {
  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      answerOptions: true,
    },
  })

  if (question && publicView) {
    return {
      ...question,
      answerOptions: question.answerOptions.map(
        ({ isCorrect, ...rest }) => rest
      ),
    }
  }

  return question
}

/**
 * Create a new question with optional answer options
 */
export async function createQuestion(data: {
  storyId: string
  stageType: StageType
  questionType: QuestionType
  questionText: string
  xpValue?: number
  answerOptions?: { optionText: string; isCorrect?: boolean }[]
}) {
  return prisma.question.create({
    data: {
      storyId: data.storyId,
      stageType: data.stageType,
      questionType: data.questionType,
      questionText: data.questionText,
      xpValue: data.xpValue ?? 0,
      answerOptions: data.answerOptions
        ? {
            create: data.answerOptions.map((opt) => ({
              optionText: opt.optionText,
              isCorrect: opt.isCorrect ?? false,
            })),
          }
        : undefined,
    },
    include: {
      answerOptions: true,
    },
  })
}

/**
 * Update a question
 */
export async function updateQuestion(
  id: string,
  data: {
    stageType?: StageType
    questionType?: QuestionType
    questionText?: string
    xpValue?: number
  }
) {
  return prisma.question.update({
    where: { id },
    data,
  })
}

/**
 * Delete a question
 */
export async function deleteQuestion(id: string) {
  return prisma.question.delete({
    where: { id },
  })
}

/**
 * Check if question exists
 */
export async function questionExists(id: string): Promise<boolean> {
  const count = await prisma.question.count({ where: { id } })
  return count > 0
}

// Answer Options operations

/**
 * Create answer option for a question
 */
export async function createAnswerOption(
  questionId: string,
  data: {
    optionText: string
    isCorrect?: boolean
  }
) {
  return prisma.answerOption.create({
    data: {
      questionId,
      optionText: data.optionText,
      isCorrect: data.isCorrect ?? false,
    },
  })
}

/**
 * Update answer option
 */
export async function updateAnswerOption(
  id: string,
  data: {
    optionText?: string
    isCorrect?: boolean
  }
) {
  return prisma.answerOption.update({
    where: { id },
    data,
  })
}

/**
 * Delete answer option
 */
export async function deleteAnswerOption(id: string) {
  return prisma.answerOption.delete({
    where: { id },
  })
}
