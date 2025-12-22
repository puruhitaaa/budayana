import prisma from "./index"
import { StoryType } from "./prisma/generated/client"

const storiesToSeed = [
  {
    title: "Pre-Test",
    storyType: StoryType.INTERACTIVE,
    order: 1,
  },
  {
    title: "Cerita Rakyat",
    storyType: StoryType.STATIC,
    order: 2,
  },
  {
    title: "Cerita Rakyat Interaktif",
    storyType: StoryType.INTERACTIVE,
    order: 3,
  },
  {
    title: "Post-Test",
    storyType: StoryType.INTERACTIVE,
    order: 4,
  },
]

async function main() {
  console.log("Start seeding stories...")

  const islands = await prisma.island.findMany()

  for (const island of islands) {
    const islandId = island.id
    console.log(
      `Seeding stories for island: ${island.islandName} (${islandId})`
    )

    for (const storyData of storiesToSeed) {
      const existingStory = await prisma.story.findFirst({
        where: {
          islandId: islandId,
          title: storyData.title,
        },
      })

      if (!existingStory) {
        await prisma.story.create({
          data: {
            ...storyData,
            islandId: islandId,
          },
        })
        console.log(`  Created story: ${storyData.title}`)
      } else {
        console.log(`  Story already exists: ${storyData.title}`)
      }
    }
  }

  console.log("Seeding stories finished.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
