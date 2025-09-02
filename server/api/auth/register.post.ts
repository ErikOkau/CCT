import { defineEventHandler, readBody, createError } from 'h3'
import { AuthService } from '~/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { username, password, email } = body

    if (!username || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username and password are required'
      })
    }

    if (username.length < 3) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username must be at least 3 characters long'
      })
    }

    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password must be at least 6 characters long'
      })
    }

    // Create user (default role is USER)
    const user = await AuthService.createUser(username, password, 'USER')

    return {
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    }
  } catch (error) {
    console.error('Registration error:', error)
    
    // Handle duplicate username error
    if (error.code === 'P2002' && error.meta?.target?.includes('username')) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Username already exists'
      })
    }
    
    throw error
  }
})
