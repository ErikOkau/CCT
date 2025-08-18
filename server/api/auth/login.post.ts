import { AuthService } from '~/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { username, password } = body

    if (!username || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username and password are required'
      })
    }

    const user = await AuthService.authenticateUser({ username, password })

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials'
      })
    }

    // Set session cookie
    setCookie(event, 'auth-session', JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    }
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
})
