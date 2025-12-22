/**
 * Service layer for Statistics domain
 */
import prisma from "../../lib/db"

export async function getStatistics(userId: string) {
  // Parallelize queries for performance
  const [user, storiesCompletedCount, scores] = await Promise.all([
    // 1. Get User Total XP
    prisma.user.findUnique({
      where: { id: userId },
      select: { totalXp: true },
    }),

    // 2. Get Stories Completed (Distinct stories finished)
    prisma.storyAttempt.groupBy({
      by: ["storyId"],
      where: {
        userId,
        finishedAt: { not: null },
      },
    }),

    // 3. Get Average Scores
    prisma.storyAttempt.aggregate({
      where: {
        userId,
        finishedAt: { not: null },
      },
      _avg: {
        preTestScore: true,
        postTestScore: true,
      },
    }),
  ])

  // Helper to safely convert Decimal/null to number
  const toNumber = (val: any): number => {
    if (val === null || val === undefined) return 0
    return typeof val.toNumber === "function" ? val.toNumber() : Number(val)
  }

  return {
    storiesCompleted: storiesCompletedCount.length,
    totalXp: user?.totalXp ?? 0,
    averagePreTestScore: Math.round(toNumber(scores._avg.preTestScore)),
    averagePostTestScore: Math.round(toNumber(scores._avg.postTestScore)),
  }
}
