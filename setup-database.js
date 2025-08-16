const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Setting up database...')
  
  try {
    // Create initial season
    const season = await prisma.season.upsert({
      where: { name: '20-2' },
      update: {},
      create: {
        name: '20-2',
        startDate: new Date('2024-01-01'),
        isActive: true
      }
    })
    console.log('✅ Season created:', season.name)

    // Create initial guild
    const guild = await prisma.guild.upsert({
      where: { name: 'Chaos Control Team' },
      update: {},
      create: {
        name: 'Chaos Control Team',
        description: 'CCT Guild'
      }
    })
    console.log('✅ Guild created:', guild.name)

    console.log('\n🎉 Database setup complete!')
    console.log('You can now use the application to store guild battle results.')
    
  } catch (error) {
    console.error('❌ Error setting up database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
