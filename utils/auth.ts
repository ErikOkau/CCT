import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

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
    try {
      const user = await prisma.user.findUnique({
        where: { username: credentials.username }
      })

      if (!user) {
        return null
      }

      const isValidPassword = await bcrypt.compare(credentials.password, user.password)
      
      if (!isValidPassword) {
        return null
      }

      return {
        id: user.id,
        username: user.username,
        role: user.role
      }
    } catch (error) {
      console.error('Authentication error:', error)
      return null
    }
  }

  /**
   * Create a new user (admin only)
   */
  static async createUser(username: string, password: string, role: 'USER' | 'ADMIN' = 'USER') {
    try {
      const hashedPassword = await bcrypt.hash(password, 10)
      
      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          role
        }
      })

      return {
        id: user.id,
        username: user.username,
        role: user.role
      }
    } catch (error) {
      console.error('User creation error:', error)
      throw error
    }
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
