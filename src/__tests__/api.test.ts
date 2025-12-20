/**
 * API Routes Tests
 * Uses Bun's built-in test runner
 */
import { describe, test, expect } from "bun:test"
import { Elysia } from "elysia"
import { islandRoutes } from "../routes/islands"
import { storyRoutes } from "../routes/stories"
import { questionRoutes } from "../routes/questions"
import {
  encodeCursor,
  decodeCursor,
  normalizeLimit,
} from "../lib/utils/pagination"
import {
  buildWhereClause,
  buildSearchFilter,
  combineWhereClauses,
} from "../lib/utils/query-helpers"

// Create test app with public routes only
const app = new Elysia({ prefix: "/api" })
  .use(islandRoutes)
  .use(storyRoutes)
  .use(questionRoutes)

describe("API Routes", () => {
  describe("Islands Routes", () => {
    test("GET /api/islands returns paginated response", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/islands")
      )

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty("items")
      expect(data).toHaveProperty("hasMore")
      expect(data).toHaveProperty("nextCursor")
      expect(Array.isArray(data.items)).toBe(true)
    })

    test("GET /api/islands with limit parameter", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/islands?limit=5")
      )

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.items.length).toBeLessThanOrEqual(5)
    })

    test("GET /api/islands/:id returns 404 for non-existent", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/islands/non-existent-id")
      )

      expect(response.status).toBe(404)

      const data = await response.json()
      expect(data).toHaveProperty("error")
      expect(data.code).toBe("NOT_FOUND")
    })
  })

  describe("Stories Routes", () => {
    test("GET /api/stories returns paginated response", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/stories")
      )

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty("items")
      expect(data).toHaveProperty("hasMore")
    })

    test("GET /api/stories/:id returns 404 for non-existent", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/stories/non-existent-id")
      )

      expect(response.status).toBe(404)
    })
  })

  describe("Questions Routes", () => {
    test("GET /api/questions returns paginated response", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/questions")
      )

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty("items")
    })
  })
})

describe("Pagination Utility", () => {
  test("encodeCursor and decodeCursor are inverse operations", () => {
    const original = { id: "test-id-123", sortValue: "2024-01-15" }
    const encoded = encodeCursor(original)
    const decoded = decodeCursor(encoded)

    expect(decoded).toEqual(original)
  })

  test("decodeCursor returns null for invalid cursor", () => {
    const result = decodeCursor("invalid-cursor")
    expect(result).toBeNull()
  })

  test("normalizeLimit respects bounds", () => {
    expect(normalizeLimit(undefined)).toBe(20) // default
    expect(normalizeLimit(0)).toBe(20) // min
    expect(normalizeLimit(50)).toBe(50) // within bounds
    expect(normalizeLimit(200)).toBe(100) // max
  })
})

describe("Query Helpers", () => {
  test("buildWhereClause filters allowed fields only", () => {
    const filters = { name: "test", blocked: "value" }
    const result = buildWhereClause(filters, ["name"])

    expect(result).toEqual({ name: "test" })
    expect(result).not.toHaveProperty("blocked")
  })

  test("buildSearchFilter creates OR clause for multiple fields", () => {
    const result = buildSearchFilter("test", ["title", "description"])

    expect(result).toHaveProperty("OR")
    expect(result?.OR).toHaveLength(2)
  })

  test("buildSearchFilter returns undefined for empty search", () => {
    expect(buildSearchFilter("", ["title"])).toBeUndefined()
    expect(buildSearchFilter(undefined, ["title"])).toBeUndefined()
  })

  test("combineWhereClauses merges multiple clauses", () => {
    const clause1 = { islandId: "abc" }
    const clause2 = { storyType: "STATIC" }

    const result = combineWhereClauses(clause1, clause2)

    expect(result).toEqual({ islandId: "abc", storyType: "STATIC" })
  })
})
