import { Elysia } from 'elysia'
import bcrypt from 'bcryptjs'
import { prisma } from '../config/prisma'
import crypto from 'crypto'

/**
 * Registers the authentication route for admin/moderator login.
 * Returns an API key for valid credentials.
 * @param {Elysia} app - The Elysia app instance.
 * @returns {Elysia}
 */
export const authRoute = (app: Elysia): Elysia =>
    app.post(
        '/auth',
        async ({ body }): Promise<{ apiKey?: string; error?: string }> => {
            const { username, password } = body as { username: string; password: string }
            if (!username || !password) {
                return { error: 'Username and password required' }
            }

            // Allow ADMIN and MODERATOR roles
            const user = await prisma.user.findUnique({ where: { username } })
            if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
                return { error: 'Invalid credentials' }
            }

            const valid = await bcrypt.compare(password, user.password)
            if (!valid) {
                return { error: 'Invalid credentials' }
            }

            // Generate API key
            const apiKey = crypto.randomBytes(32).toString('hex')
            await prisma.apiKey.create({
                data: {
                    key: apiKey,
                    adminId: user.id,
                    createdAt: new Date(),
                    thingyMod: true
                }
            })

            return { apiKey }
        },
        {
            detail: {
                tags: ['Auth'],
                summary: 'Authenticate admin and get API key',
                description: 'Returns an API key for a valid admin login.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    username: { type: 'string' },
                                    password: { type: 'string' }
                                },
                                required: ['username', 'password']
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'API key or error',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        apiKey: { type: 'string' },
                                        error: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    )
