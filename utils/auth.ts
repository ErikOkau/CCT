// Auth service temporarily disabled for Supabase migration
// TODO: Replace with Supabase Auth

export interface LoginCredentials {
  username: string
  password: string
}

export interface UserSession {
  id: string
  username: string
  role: 'USER' | 'ADMIN'
}

export class AuthService {
  /**
   * Authenticate user with username and password
   */
  static async authenticateUser(credentials: LoginCredentials): Promise<UserSession | null> {
    // TODO: Implement Supabase authentication
    console.log('📝 Authentication temporarily disabled for Supabase migration')
    return null
  }

  /**
   * Create a new user (admin only)
   */
  static async createUser(username: string, password: string, role: 'USER' | 'ADMIN' = 'USER') {
    // TODO: Implement Supabase user creation
    console.log('📝 User creation temporarily disabled for Supabase migration')
    throw new Error('User creation temporarily disabled for Supabase migration')
  }

  /**
   * Check if user is admin
   */
  static isAdmin(session: UserSession | null): boolean {
    return session?.role === 'ADMIN'
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(session: UserSession | null): boolean {
    return session !== null
  }
}
