import prisma from "./index"
import {
  StoryType,
  SlideType,
  StageType,
  QuestionType,
} from "./prisma/generated/client"

const XP_PER_QUESTION = 16

interface QuestionOption {
  text: string
  isCorrect: boolean
}

interface QuestionData {
  slideNumber: number
  questionType: QuestionType
  questionText: string
  options?: QuestionOption[]
  metadata?: {
    items: Array<{ id: string; label: string }>
    correctOrder: string[]
  }
  isBonus?: boolean
}

interface InteractiveStoryData {
  title: string
  storyImageMap: Record<number, string>
  questions: QuestionData[]
}

const interactiveStoryData: Record<string, InteractiveStoryData> = {
  sulawesi: {
    title: "Nenek Pakande",
    storyImageMap: {
      1: "/assets/budayana/islands/cerita sulawesi 1.png",
      3: "/assets/budayana/islands/cerita sulawesi 22.png",
      5: "/assets/budayana/islands/cerita sulawesi 3.png",
      7: "/assets/budayana/islands/cerita sulawesi 4 (1).png",
      9: "/assets/budayana/islands/cerita sulawesi 5.png",
    },
    questions: [
      {
        slideNumber: 2,
        questionType: QuestionType.MCQ,
        questionText: "Apa yang sedang dilakukan oleh anak-anak tersebut?",
        options: [
          { text: "Berlari-larian", isCorrect: true },
          { text: "Main layangan", isCorrect: false },
          { text: "Main kelereng", isCorrect: false },
          { text: "Memancing", isCorrect: false },
        ],
      },
      {
        slideNumber: 4,
        questionType: QuestionType.TRUE_FALSE,
        questionText:
          "Apakah anak-anak itu langsung pulang saat waktu sore tiba?",
        options: [
          { text: "Benar", isCorrect: false },
          { text: "Salah", isCorrect: true },
        ],
      },
      {
        slideNumber: 6,
        questionType: QuestionType.MCQ,
        questionText: "Apa yang dibawa oleh nenek pakande?",
        options: [
          { text: "Panci", isCorrect: false },
          { text: "Jaring", isCorrect: false },
          { text: "Karung", isCorrect: true },
          { text: "Perangkap", isCorrect: false },
        ],
      },
      {
        slideNumber: 8,
        questionType: QuestionType.MCQ,
        questionText: "Dimana warga desa mencari anak-anak yang hilang?",
        options: [
          { text: "Kota", isCorrect: false },
          { text: "Hutan", isCorrect: true },
          { text: "Gunung", isCorrect: false },
          { text: "Sawah", isCorrect: false },
        ],
      },
      {
        slideNumber: 10,
        questionType: QuestionType.DRAG_DROP,
        questionText:
          "Urutkan kejadian apa saja yang terjadi pada cerita nenek Pakande!",
        metadata: {
          items: [
            { id: "search", label: "Anak-anak ketakutan" },
            { id: "play", label: "Anak-anak bermain di ladang" },
            { id: "home", label: "Warga mencari anak-anak" },
            { id: "appear", label: "Nenek Pakande muncul" },
            { id: "sunset", label: "Sore hari mulai datang" },
          ],
          correctOrder: ["play", "sunset", "appear", "search", "home"],
        },
      },
      {
        slideNumber: 11,
        questionType: QuestionType.ESSAY,
        questionText:
          "Apa pesan moral yang bisa di ambil dari cerita tersebut?",
        isBonus: true,
      },
    ],
  },

  sumatra: {
    title: "Malin Kundang",
    storyImageMap: {
      1: "/assets/budayana/islands/cerita 1 malin (1).png",
      3: "/assets/budayana/islands/cerita 2 malin (2).png",
      5: "/assets/budayana/islands/cerita 3 malin (1).png",
      7: "/assets/budayana/islands/cerita 5 malin (2).png",
      9: "/assets/budayana/islands/cerita 6 malin (3).png",
    },
    questions: [
      {
        slideNumber: 2,
        questionType: QuestionType.MCQ,
        questionText: "Apa yang sedang malin lakukan?",
        options: [
          { text: "Membantu Ibunya", isCorrect: true },
          { text: "Menjemur Baju", isCorrect: false },
          { text: "Memancing", isCorrect: false },
          { text: "Tiduran", isCorrect: false },
        ],
      },
      {
        slideNumber: 4,
        questionType: QuestionType.TRUE_FALSE,
        questionText: "Apakah ibu malin selalu memarahi malin?",
        options: [
          { text: "Benar", isCorrect: false },
          { text: "Salah", isCorrect: true },
        ],
      },
      {
        slideNumber: 6,
        questionType: QuestionType.MCQ,
        questionText: "Siapa yang menghampiri malin di pelabuhan?",
        options: [
          { text: "Bapaknya", isCorrect: false },
          { text: "Temannya", isCorrect: false },
          { text: "Ibunya", isCorrect: true },
          { text: "Tetangganya", isCorrect: false },
        ],
      },
      {
        slideNumber: 8,
        questionType: QuestionType.MCQ,
        questionText: "Kenapa ibu malin menangis?",
        options: [
          { text: "Kaki sang ibu terinjak", isCorrect: false },
          { text: "Malin tidak menganggap ibu", isCorrect: true },
          { text: "Malin memeluk sang ibu", isCorrect: false },
          { text: "Ibu tersandung ikan di pasar", isCorrect: false },
        ],
      },
      {
        slideNumber: 10,
        questionType: QuestionType.DRAG_DROP,
        questionText:
          "Urutkan kejadian apa saja yang terjadi pada cerita malin kundang!",
        metadata: {
          items: [
            { id: "stone", label: "Malin dikutuk menjadi batu" },
            { id: "leave", label: "Malin tinggal bersama ibunya" },
            { id: "ship", label: "Malin menjadi saudagar kaya" },
            { id: "miss", label: "Malin pergi merantau" },
            { id: "deny", label: "Malin mengingkari ibunya" },
          ],
          correctOrder: ["leave", "miss", "ship", "deny", "stone"],
        },
      },
    ],
  },
}

async function main() {
  console.log("Start seeding interactive stories...")

  for (const [islandKey, data] of Object.entries(interactiveStoryData)) {
    // Find island by name (case-insensitive)
    const island = await prisma.island.findFirst({
      where: { islandName: { equals: islandKey, mode: "insensitive" } },
    })

    if (!island) {
      console.log(`Island not found: ${islandKey}, skipping...`)
      continue
    }

    console.log(`Processing interactive story for island: ${island.islandName}`)

    // Find or create INTERACTIVE story for this island
    let story = await prisma.story.findFirst({
      where: {
        islandId: island.id,
        storyType: StoryType.INTERACTIVE,
        NOT: {
          title: { in: ["Pre-Test", "Post-Test"] },
        },
      },
    })

    if (!story) {
      story = await prisma.story.create({
        data: {
          islandId: island.id,
          title: data.title,
          storyType: StoryType.INTERACTIVE,
          order: 1,
        },
      })
      console.log(`  Created new INTERACTIVE story: ${data.title}`)
    } else {
      await prisma.story.update({
        where: { id: story.id },
        data: { title: data.title },
      })
      console.log(`  Updated existing INTERACTIVE story: ${data.title}`)
    }

    // Clean up existing interactive slides and questions
    await prisma.interactiveSlide.deleteMany({
      where: { storyId: story.id },
    })
    console.log(`  Deleted existing interactive slides`)

    await prisma.question.deleteMany({
      where: { storyId: story.id, stageType: StageType.INTERACTIVE },
    })
    console.log(`  Deleted existing interactive questions`)

    // Create questions and map slideNumber to questionId
    const questionIdMap: Record<number, string> = {}

    for (const q of data.questions) {
      const questionData: {
        storyId: string
        stageType: StageType
        questionType: QuestionType
        questionText: string
        xpValue: number
        metadata?: object
      } = {
        storyId: story.id,
        stageType: StageType.INTERACTIVE,
        questionType: q.questionType,
        questionText: q.questionText,
        xpValue: XP_PER_QUESTION,
      }

      // Add metadata for DRAG_DROP questions
      if (q.questionType === QuestionType.DRAG_DROP && q.metadata) {
        questionData.metadata = q.metadata
      }

      // Create question with answer options if applicable
      if (q.options && q.options.length > 0) {
        const question = await prisma.question.create({
          data: {
            ...questionData,
            answerOptions: {
              create: q.options.map((opt) => ({
                optionText: opt.text,
                isCorrect: opt.isCorrect,
              })),
            },
          },
        })
        questionIdMap[q.slideNumber] = question.id
      } else {
        // ESSAY or DRAG_DROP without options
        const question = await prisma.question.create({
          data: questionData,
        })
        questionIdMap[q.slideNumber] = question.id
      }
    }
    console.log(`  Created ${data.questions.length} questions`)

    // Create interactive slides
    const slides: Array<{
      slideNumber: number
      slideType: SlideType
      imageUrl?: string | null
      questionId?: string | null
    }> = []

    // Slides 1-10: alternating IMAGE and GAME
    for (let i = 1; i <= 10; i++) {
      if (i % 2 === 1) {
        // Odd: IMAGE slide with storyImageMap
        slides.push({
          slideNumber: i,
          slideType: SlideType.IMAGE,
          imageUrl: data.storyImageMap[i] || null,
        })
      } else {
        // Even: GAME slide linked to question
        slides.push({
          slideNumber: i,
          slideType: SlideType.GAME,
          questionId: questionIdMap[i] || null,
        })
      }
    }

    // Slide 11: ESSAY bonus (if exists)
    if (questionIdMap[11]) {
      slides.push({
        slideNumber: 11,
        slideType: SlideType.ESSAY,
        questionId: questionIdMap[11],
      })
    }

    // Final slide: ENDING
    slides.push({
      slideNumber: questionIdMap[11] ? 12 : 11,
      slideType: SlideType.ENDING,
    })

    // Insert all slides
    for (const slide of slides) {
      await prisma.interactiveSlide.create({
        data: {
          storyId: story.id,
          slideNumber: slide.slideNumber,
          slideType: slide.slideType,
          imageUrl: slide.imageUrl || null,
          questionId: slide.questionId || null,
        },
      })
    }
    console.log(`  Created ${slides.length} interactive slides`)
  }

  console.log("Seeding interactive stories finished.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
