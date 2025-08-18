export default defineEventHandler(async (event) => {
  try {
    const sessionCookie = getCookie(event, 'auth-session')
    
    if (!sessionCookie) {
      return {
        authenticated: false,
        user: null
      }
    }

    const user = JSON.parse(sessionCookie)
    
    return {
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    }
  } catch (error) {
    console.error('Session check error:', error)
    return {
      authenticated: false,
      user: null
    }
  }
})
