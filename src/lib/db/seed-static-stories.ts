import prisma from "./index"
import { StoryType, SlideType } from "./prisma/generated/client"

const storyData = {
  jawa: {
    title: "Roro Jonggrang",
    subtitle: "Legenda Candi Prambanan",
    coverImage: "/assets/budayana/islands/cover papua.png",
    backgroundImage: "/assets/budayana/islands/wood cover.png",
    pages: [
      { type: "cover" },
      {
        content: `Di sebuah kerajaan yang megah bernama 
Prambanan, hiduplah seorang putri cantik 
bernama Roro Jonggrang. Ia dikenal baik 
hati, sopan, dan sangat disayangi rakyatnya. 
Namun suatu hari, negeri tetangga, Kerajaan 
Pengging, menyerang Prambanan.

Pemimpin pasukan itu adalah seorang 
ksatria gagah bernama Bandung Bondowoso. 
Ia kuat, sakti, dan tidak pernah kalah dalam 
pertempuran. Dalam waktu singkat, ia 
berhasil menguasai Prambanan.`,
      },
      {
        content: `Setelah menang, Bandung Bondowoso 
melihat kecantikan Roro Jonggrang dan 
langsung jatuh hati. Suatu hari, ia datang ke 
istana dan berkata, "Roro Jonggrang, aku 
ingin menikah denganmu. Jadilah 
permaisuriku." 

Roro Jonggrang terkejut. Ia tidak menyukai 
Bandung Bondowoso, apalagi ia sudah 
menyerang kerajaannya. Namun ia tidak 
bisa menolak secara langsung, karena ia 
takut akan kemarahan Bandung Bondowoso.`,
      },
      {
        content: `Setelah berpikir, ia akhirnya menjawab, 
"Baik... aku bersedia. Tapi ada satu syarat." 
Bandung Bondowoso tersenyum percaya 
diri. "Katakan. Apa syaratmu?" 

Roro Jonggrang berkata, "Bangunlah seribu 
candi untukku dalam satu malam." Bandung 
Bondowoso terdiam sejenak, lalu tertawa. 
"Hanya itu? Tentu aku bisa!" 

Roro Jonggrang sebenarnya berharap syarat 
itu mustahil dilakukan.`,
      },
      {
        content: `Tetapi ia tidak tahu bahwa Bandung 
Bondowoso memiliki kesaktian. Malam pun 
tiba. Bandung Bondowoso memanggil 
makhluk-makhluk gaib untuk membantunya. 
"Hai para jin, bantulah aku membangun 
seribu candi malam ini!" teriaknya. 

Dalam sekejap, ribuan jin datang dan mulai 
bekerja. Mereka mengangkat batu, 
menyusun dinding, dan membuat patung-
patung. Suara dentingan batu terdengar di 
seluruh Prambanan.`,
      },
      {
        content: `Roro Jonggrang melihat dari kejauhan dan 
panik. "Oh tidak! Dia benar-benar bisa 
menyelesaikannya!" Ia memanggil para 
dayang. "Kita harus menghentikan ini! 
Bangunkan para wanita desa. Suruh mereka 
menumbuk padi dan menyalakan api besar. 
Kita buat suasana seperti fajar!"

Para wanita mulai memukul lesung dengan 
keras. Api unggun dinyalakan sehingga 
cahaya menyinari langit. Ayam jantan pun 
ikut berkokok.`,
      },
      {
        content: `Mendengar semua itu, para jin panik. "Pagi 
sudah tiba! Kita harus pergi!" Mereka 
menghilang seketika, meninggalkan 
pekerjaan yang belum selesai—candi hanya 
berjumlah 999.

Bandung Bondowoso sangat kecewa dan 
marah ketika mengetahui ia tertipu. "Roro 
Jonggrang! Kau menipuku!" Roro Jonggrang 
berusaha tenang. "Aku hanya ingin 
melindungi kerajaanku."`,
      },
      {
        content: `Karena sangat marah, Bandung Bondowoso 
mengutuk sang putri. "Kalau begitu, jadilah 
kau pelengkap candi yang ke-1000!"

Dalam sekejap, Roro Jonggrang berubah 
menjadi patung batu yang sangat indah. 
Patung itu kini dikenal sebagai bagian dari 
Candi Prambanan."`,
      },
      {
        type: "ending",
        content: "Cerita Selesai.",
      },
    ],
  },

  papua: {
    title: "Biwar Penakluk Naga",
    subtitle: "Legenda Rakyat Papua",
    coverImage: "/assets/budayana/islands/cover book papua.png",
    backgroundImage: "/assets/budayana/islands/wood cover.png",
    pages: [
      { type: "cover" },
      {
        content: `Di tanah Papua yang indah, hiduplah 
seorang pemuda bernama Biwar. Ia 
tinggal di sebuah kampung kecil di tepi 
hutan. Biwar terkenal pemberani, suka 
menolong, dan selalu menjaga keluarganya.

Namun, kehidupan warga kampung sering 
terganggu oleh makhluk jahat, yaitu 
seekor naga raksasa yang tinggal di 
dalam gua besar dekat sungai.`,
      },
      {
        content: `Naga itu sering datang untuk merusak 
ladang, memakan hewan ternak, bahkan 
membuat warga ketakutan. Suatu hari, 
kepala suku mengumpulkan seluruh warga.

"Warga semua," katanya dengan suara 
sedih, "kita tidak bisa hidup tenang. Naga 
itu harus dihentikan. Tapi siapa yang 
berani melawannya?"`,
      },
      {
        content: `Semua orang saling pandang. Tidak ada 
yang berani maju. Namun Biwar berdiri 
dan berkata dengan gagah, "Aku akan 
menghadapi naga itu, Kepala Suku."

Ibunya terkejut. "Biwar, itu berbahaya 
sekali!" Biwar tersenyum menenangkan. 

"Ibu, jangan khawatir. Aku akan hati-hati. 
Aku hanya ingin kampung kita aman."`,
      },
      {
        content: `Pagi-pagi sekali, Biwar membawa 
tombak, busur, dan panah. Ia berjalan 
melewati hutan, menyeberangi sungai, 
dan menaiki bukit batu.

Saat mendekati gua naga, ia mendengar 
suara mengerikan. "Grrrrrr… Siapa yang 
berani datang ke sini?"`,
      },
      {
        content: `Suara itu bergema dari dalam gua. 
Biwar menjawab, "Aku Biwar dari 
Kampung Wamena! Aku datang untuk 
menghentikan kejahatanmu!"

Tiba-tiba, naga raksasa keluar dari gua. 
Sisiknya keras, matanya menyala merah, 
dan napasnya panas bagaikan api.`,
      },
      {
        content: `"Anak kecil sepertimu ingin menantangku?" 
Naga itu tertawa keras. "Kau tidak akan 
bisa menang!" Biwar memegang 
tombaknya dengan erat. "Aku tidak takut."

Naga itu menyerang dengan cepat. Biwar 
melompat ke samping, menghindari ekor 
naga yang menghantam tanah hingga 
tanah bergetar.`,
      },
      {
        content: `Biwar memanah tepat ke arah mata 
naga. "Ini untuk kampungku!" Anak panah 
itu mengenai sasaran, membuat naga 
kesakitan dan berteriak.

"Aaarrrggghhh!" Naga itu mengamuk dan 
menyemburkan api, tetapi Biwar dengan 
gesit bersembunyi di balik batu.`,
      },
      {
        content: `Akhirnya, saat naga mulai lelah, Biwar 
mendekat dan menusuk jantungnya 
dengan tombak. Naga itu jatuh ke tanah 
dan tak bergerak lagi.

Dengan langkah bangga, Biwar kembali 
ke kampung membawa kabar bahagia. 
Warga menyambutnya dengan sorak-sorai. 
"Biwar! Pahlawan kita!"`,
      },
      {
        type: "ending",
        content: "Cerita Selesai.",
      },
    ],
  },
}

async function main() {
  console.log("Start seeding static stories...")

  const islands = await prisma.island.findMany()

  for (const island of islands) {
    const islandKey = island.islandName.toLowerCase()
    const data = storyData[islandKey as keyof typeof storyData]

    if (!data) {
      console.log(`No story data found for island: ${island.islandName}`)
      continue
    }

    console.log(`Processing story for island: ${island.islandName}`)

    // Find the "Cerita Rakyat Interaktif" story
    const story = await prisma.story.findFirst({
      where: {
        islandId: island.id,
        title: "Cerita Rakyat Interaktif",
      },
    })

    if (!story) {
      console.log(`  Story 'Cerita Rakyat Interaktif' not found, skipping...`)
      continue
    }

    // Update story metadata
    await prisma.story.update({
      where: { id: story.id },
      data: {
        title: data.title, // Update title to specific story title
        subtitle: data.subtitle,
        coverImage: data.coverImage,
        backgroundImage: data.backgroundImage,
        storyType: StoryType.STATIC,
      },
    })
    console.log(`  Updated story metadata: ${data.title}`)

    // Delete existing slides
    await prisma.staticSlide.deleteMany({
      where: { storyId: story.id },
    })
    console.log(`  Deleted existing slides`)

    // Create new slides
    for (let i = 0; i < data.pages.length; i++) {
      const page = data.pages[i]
      let slideType = SlideType.CONTENT

      if (page.type === "cover") slideType = SlideType.COVER
      else if (page.type === "ending") slideType = SlideType.ENDING

      await prisma.staticSlide.create({
        data: {
          storyId: story.id,
          slideNumber: i + 1,
          slideType: slideType,
          contentText: page.content,
        },
      })
    }
    console.log(`  Created ${data.pages.length} slides`)
  }

  console.log("Seeding static stories finished.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
