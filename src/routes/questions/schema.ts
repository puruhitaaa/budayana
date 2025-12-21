/**
 * TypeBox validation schemas for Questions domain
 */
import { t } from "elysia"
import {
  createPaginatedSchema,
  PaginationQuerySchema,
} from "../../lib/utils/schemas"

// Enums
export const StageTypeEnum = t.Union([
  t.Literal("PRE_TEST"),
  t.Literal("POST_TEST"),
  t.Literal("INTERACTIVE"),
])
export const QuestionTypeEnum = t.Union([
  t.Literal("MCQ"),
  t.Literal("TRUE_FALSE"),
  t.Literal("DRAG_DROP"),
  t.Literal("ESSAY"),
])

// Answer Option schema
export const AnswerOptionSchema = t.Object({
  id: t.String(),
  questionId: t.String(),
  optionText: t.String(),
  isCorrect: t.Optional(t.Boolean()),
})

// Base Question schema
export const QuestionSchema = t.Object({
  id: t.String(),
  storyId: t.String(),
  stageType: StageTypeEnum,
  questionType: QuestionTypeEnum,
  questionText: t.String(),
  xpValue: t.Number(),
})

// Question with relations
export const QuestionWithOptionsSchema = t.Object({
  ...QuestionSchema.properties,
  answerOptions: t.Optional(t.Array(AnswerOptionSchema)),
})

// Create Question input
export const CreateQuestionSchema = t.Object({
  storyId: t.String(),
  stageType: StageTypeEnum,
  questionType: QuestionTypeEnum,
  questionText: t.String({ minLength: 1 }),
  xpValue: t.Optional(t.Number({ minimum: 0, default: 0 })),
  answerOptions: t.Optional(
    t.Array(
      t.Object({
        optionText: t.String({ minLength: 1 }),
        isCorrect: t.Optional(t.Boolean({ default: false })),
      })
    )
  ),
})

// Update Question input
export const UpdateQuestionSchema = t.Partial(
  t.Object({
    stageType: StageTypeEnum,
    questionType: QuestionTypeEnum,
    questionText: t.String({ minLength: 1 }),
    xpValue: t.Number({ minimum: 0 }),
  })
)

// Question list query params
export const QuestionQuerySchema = t.Composite([
  PaginationQuerySchema,
  t.Object({
    storyId: t.Optional(t.String()),
    stageType: t.Optional(StageTypeEnum),
    questionType: t.Optional(QuestionTypeEnum),
  }),
])

// Create Answer Option input
export const CreateAnswerOptionSchema = t.Object({
  optionText: t.String({ minLength: 1 }),
  isCorrect: t.Optional(t.Boolean({ default: false })),
})

// Update Answer Option input
export const UpdateAnswerOptionSchema = t.Partial(CreateAnswerOptionSchema)

// Paginated response
export const PaginatedQuestionsSchema = createPaginatedSchema(QuestionSchema)
