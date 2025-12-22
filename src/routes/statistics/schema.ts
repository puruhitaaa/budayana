import { t } from "elysia"

export const StatisticsSchema = t.Object({
  storiesCompleted: t.Number(),
  totalXp: t.Number(),
  averagePreTestScore: t.Number(),
  averagePostTestScore: t.Number(),
})
