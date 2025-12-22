/**
 * TypeBox validation schemas for Attempts domain
 */
import { t } from "elysia"
import {
  createPaginatedSchema,
  PaginationQuerySchema,
} from "../../lib/utils/schemas"

// Enums
export const AttemptStageTypeEnum = t.Union([
  t.Literal("PRE_TEST"),
  t.Literal("STORY"),
  t.Literal("POST_TEST"),
])

// Stage Attempt schema
export const StageAttemptSchema = t.Object({
  id: t.String(),
  attemptId: t.String(),
  stageType: AttemptStageTypeEnum,
  timeSpentSeconds: t.Number(),
  xpGained: t.Number(),
  score: t.Nullable(t.Number()),
})

// Question Attempt Log schema
export const QuestionAttemptLogSchema = t.Object({
  id: t.String(),
  attemptId: t.String(),
  questionId: t.String(),
  userAnswerText: t.Nullable(t.String()),
  isCorrect: t.Nullable(t.Boolean()),
  attemptCount: t.Number(),
  answeredAt: t.Date(),
})

// Base Story Attempt schema
export const StoryAttemptSchema = t.Object({
  id: t.String(),
  userId: t.String(),
  storyId: t.String(),
  startedAt: t.Date(),
  finishedAt: t.Nullable(t.Date()),
  totalTimeSeconds: t.Number(),
  totalXpGained: t.Number(),
  preTestScore: t.Nullable(t.Number()),
  postTestScore: t.Nullable(t.Number()),
  correctInteractiveCnt: t.Nullable(t.Number()),
  wrongInteractiveCnt: t.Nullable(t.Number()),
  essayAnswer: t.Nullable(t.String()),
  story: t.Optional(
    t.Object({
      title: t.String(),
    })
  ),
})

// Story Attempt with relations
export const StoryAttemptWithDetailsSchema = t.Object({
  ...StoryAttemptSchema.properties,
  stageAttempts: t.Optional(t.Array(StageAttemptSchema)),
  questionLogs: t.Optional(t.Array(QuestionAttemptLogSchema)),
})

// Create Story Attempt input
export const CreateStoryAttemptSchema = t.Object({
  storyId: t.String(),
})

// Update Story Attempt input (for finishing)
export const UpdateStoryAttemptSchema = t.Partial(
  t.Object({
    finishedAt: t.Date(),
    totalTimeSeconds: t.Number({ minimum: 0 }),
    totalXpGained: t.Number({ minimum: 0 }),
    preTestScore: t.Number(),
    postTestScore: t.Number(),
    correctInteractiveCnt: t.Number({ minimum: 0 }),
    wrongInteractiveCnt: t.Number({ minimum: 0 }),
    essayAnswer: t.String(),
  })
)

// Create Stage Attempt input
export const CreateStageAttemptSchema = t.Object({
  stageType: AttemptStageTypeEnum,
  timeSpentSeconds: t.Optional(t.Number({ minimum: 0, default: 0 })),
  xpGained: t.Optional(t.Number({ minimum: 0, default: 0 })),
  score: t.Optional(t.Number()),
})

// Create Question Attempt Log input
export const CreateQuestionLogSchema = t.Object({
  questionId: t.String(),
  selectedOptionId: t.Optional(t.String()),
  userAnswerText: t.Optional(t.String()),
  isCorrect: t.Optional(t.Boolean()),
  attemptCount: t.Optional(t.Number({ minimum: 1, default: 1 })),
})

// Attempt list query params
export const AttemptQuerySchema = t.Composite([
  PaginationQuerySchema,
  t.Object({
    userId: t.Optional(t.String()),
    storyId: t.Optional(t.String()),
    islandId: t.Optional(t.String()),
    isFinished: t.Optional(t.Boolean()),
  }),
])

// Paginated response
export const PaginatedAttemptsSchema = createPaginatedSchema(StoryAttemptSchema)
