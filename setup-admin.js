const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function setupAdmin() {
  try {
    console.log('🔧 Setting up admin user...')
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'admin' }
    })
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists')
      return
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
    
    console.log('✅ Admin user created successfully!')
    console.log('Username: admin')
    console.log('Password: admin123')
    console.log('⚠️  Please change the password after first login!')
    
  } catch (error) {
    console.error('❌ Error setting up admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupAdmin()
