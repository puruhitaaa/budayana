/**
 * TypeBox validation schemas for Stories domain
 */
import { t } from "elysia"
import {
  createPaginatedSchema,
  PaginationQuerySchema,
} from "../../lib/utils/schemas"

// Enums
export const StoryTypeEnum = t.Union([
  t.Literal("STATIC"),
  t.Literal("INTERACTIVE"),
])
export const SlideTypeEnum = t.Union([
  t.Literal("IMAGE"),
  t.Literal("GAME"),
  t.Literal("ESSAY"),
])

// Base Story schema
export const StorySchema = t.Object({
  id: t.String(),
  islandId: t.String(),
  title: t.String(),
  storyType: StoryTypeEnum,
  order: t.Number(),
})

// Static Slide schema
export const StaticSlideSchema = t.Object({
  id: t.String(),
  storyId: t.String(),
  slideNumber: t.Number(),
  contentText: t.Nullable(t.String()),
  imageUrl: t.Nullable(t.String()),
})

// Interactive Slide schema
export const InteractiveSlideSchema = t.Object({
  id: t.String(),
  storyId: t.String(),
  questionId: t.Nullable(t.String()),
  slideNumber: t.Number(),
  slideType: SlideTypeEnum,
  imageUrl: t.Nullable(t.String()),
  contentText: t.Nullable(t.String()),
})

// Story with relations
export const StoryWithSlidesSchema = t.Object({
  ...StorySchema.properties,
  staticSlides: t.Optional(t.Array(StaticSlideSchema)),
  interactiveSlides: t.Optional(t.Array(InteractiveSlideSchema)),
  _count: t.Optional(
    t.Object({
      questions: t.Number(),
      storyAttempts: t.Number(),
    })
  ),
})

// Create Story input
export const CreateStorySchema = t.Object({
  islandId: t.String(),
  title: t.String({ minLength: 1, maxLength: 200 }),
  storyType: StoryTypeEnum,
})

// Update Story input
export const UpdateStorySchema = t.Partial(
  t.Object({
    title: t.String({ minLength: 1, maxLength: 200 }),
    storyType: StoryTypeEnum,
  })
)

// Story list query params
export const StoryQuerySchema = t.Composite([
  PaginationQuerySchema,
  t.Object({
    islandId: t.Optional(t.String()),
    storyType: t.Optional(StoryTypeEnum),
  }),
])

// Create Static Slide input
export const CreateStaticSlideSchema = t.Object({
  slideNumber: t.Number({ minimum: 0 }),
  contentText: t.Optional(t.String()),
  imageUrl: t.Optional(t.String()),
})

// Create Interactive Slide input
export const CreateInteractiveSlideSchema = t.Object({
  questionId: t.Optional(t.String()),
  slideNumber: t.Number({ minimum: 0 }),
  slideType: SlideTypeEnum,
  imageUrl: t.Optional(t.String()),
  contentText: t.Optional(t.String()),
})

// Paginated response
export const PaginatedStoriesSchema = createPaginatedSchema(StorySchema)
