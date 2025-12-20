/**
 * API Routes aggregator
 * Combines all domain routes under /api prefix
 */
import { Elysia } from "elysia"
import { islandRoutes } from "./islands"
import { storyRoutes } from "./stories"
import { questionRoutes } from "./questions"
import { attemptRoutes } from "./attempts"
import { progressRoutes } from "./progress"

export const apiRoutes = new Elysia({ prefix: "/api" })
  // Public routes
  .use(islandRoutes)
  .use(storyRoutes)
  .use(questionRoutes)

  // Authenticated routes
  .use(attemptRoutes)
  .use(progressRoutes)

// Re-export individual routes for testing
export {
  islandRoutes,
  storyRoutes,
  questionRoutes,
  attemptRoutes,
  progressRoutes,
}
