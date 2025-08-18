export default defineEventHandler(async (event) => {
  try {
    // Clear session cookie
    deleteCookie(event, 'auth-session')

    return {
      success: true,
      message: 'Logged out successfully'
    }
  } catch (error) {
    console.error('Logout error:', error)
    throw error
  }
})
