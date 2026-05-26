import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Wedding settings
  const existing = await prisma.weddingSettings.count()
  if (existing === 0) {
    await prisma.weddingSettings.create({
      data: {
        brideName: 'Sarah',
        groomName: 'James',
        weddingDate: '2026-06-14',
        dressCode: 'Garden Formal',
        ceremonyTime: '4:00 PM',
        receptionTime: '6:00 PM',
        ourStory: '',
      },
    })
    console.log('Created wedding settings')
  }

  // Default budget categories
  const budgetCount = await prisma.budgetCategory.count()
  if (budgetCount === 0) {
    const cats = [
      { name: 'Venue', color: '#8FAF7A', order: 1 },
      { name: 'Catering', color: '#5DCAA5', order: 2 },
      { name: 'Photography', color: '#378ADD', order: 3 },
      { name: 'Flowers & Décor', color: '#EF9F27', order: 4 },
      { name: 'Music / DJ', color: '#D85A30', order: 5 },
      { name: 'Attire', color: '#D4537E', order: 6 },
      { name: 'Honeymoon', color: '#7F77DD', order: 7 },
      { name: 'Stationery', color: '#888780', order: 8 },
    ]
    await prisma.budgetCategory.createMany({ data: cats })
    console.log('Created budget categories')
  }

  console.log('Seed complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
