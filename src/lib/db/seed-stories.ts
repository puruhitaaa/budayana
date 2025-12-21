import prisma from "./index"
import { StoryType } from "./prisma/generated/client"

const islandIds = [
  "cmjfyxb8p000770vhns17iwmz", // Nusa Tenggara
  "cmjfyxb73000670vhfr7eskuj", // Bali
  "cmjfyxb5s000570vhpkwjjq30", // Maluku
  "cmjfyxb47000470vhk7ewxhrn", // Kalimantan
  "cmjfyxb2k000370vh7koqk6jn", // Papua
  "cmjfyxav3000270vhe3xjsvpa", // Jawa
  "cmjfyxars000170vhlhjaguoe", // Sumatra
  "cmjfyxaoz000070vh088fuob0", // Sulawesi
]

const storiesToSeed = [
  {
    title: "Pre-Test",
    storyType: StoryType.INTERACTIVE,
    order: 1,
  },
  {
    title: "Cerita Rakyat Interaktif",
    storyType: StoryType.INTERACTIVE,
    order: 2,
  },
  {
    title: "Post-Test",
    storyType: StoryType.INTERACTIVE,
    order: 3,
  },
]

async function main() {
  console.log("Start seeding stories...")

  for (const islandId of islandIds) {
    console.log(`Checking island ${islandId}...`)

    const island = await prisma.island.findUnique({
      where: { id: islandId },
    })

    if (!island) {
      console.warn(`Island with ID ${islandId} not found. Skipping.`)
      continue
    }

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
