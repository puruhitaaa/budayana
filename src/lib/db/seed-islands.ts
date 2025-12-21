import prisma from "./index"

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, "") // Trim - from end of text
}

const islands = [
  {
    islandName: "Sulawesi",
    unlockOrder: 1,
    isLockedDefault: true,
  },
  {
    islandName: "Sumatra",
    unlockOrder: 2,
    isLockedDefault: false,
  },
  {
    islandName: "Jawa",
    unlockOrder: 3,
    isLockedDefault: true,
  },
  {
    islandName: "Papua",
    unlockOrder: 4,
    isLockedDefault: true,
  },
  {
    islandName: "Kalimantan",
    unlockOrder: 5,
    isLockedDefault: true,
  },
  {
    islandName: "Maluku",
    unlockOrder: 6,
    isLockedDefault: true,
  },
  {
    islandName: "Bali",
    unlockOrder: 7,
    isLockedDefault: true,
  },
  {
    islandName: "Nusa Tenggara",
    unlockOrder: 8,
    isLockedDefault: true,
  },
]

async function main() {
  console.log("Start seeding...")

  for (const island of islands) {
    const slug = slugify(island.islandName)
    const data = { ...island, slug }

    const existingIsland = await prisma.island.findFirst({
      where: { islandName: island.islandName },
    })

    if (!existingIsland) {
      await prisma.island.create({
        data: data,
      })
      console.log(`Created island: ${island.islandName} (${slug})`)
    } else {
      await prisma.island.update({
        where: { id: existingIsland.id },
        data: data,
      })
      console.log(`Updated island: ${island.islandName} (${slug})`)
    }
  }

  console.log("Seeding finished.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
