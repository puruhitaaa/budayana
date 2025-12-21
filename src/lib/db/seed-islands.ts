import prisma from "./index"

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
    const existingIsland = await prisma.island.findFirst({
      where: { islandName: island.islandName },
    })

    if (!existingIsland) {
      await prisma.island.create({
        data: island,
      })
      console.log(`Created island: ${island.islandName}`)
    } else {
      await prisma.island.update({
        where: { id: existingIsland.id },
        data: island,
      })
      console.log(`Updated island: ${island.islandName}`)
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
