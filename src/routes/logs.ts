import { Elysia } from 'elysia'
import { logs } from '../moderation/worker'
import { prisma } from '../config/prisma'

/**
 * Registers the moderation logs route.
 * Requires a valid API key in the `x-api-key` header.
 * Returns the moderation logs array.
 * @param {Elysia} app - The Elysia app instance.
 * @returns {Elysia}
 */
export const logsRoute = (app: Elysia) =>
    app.get(
        '/logs',
        async ({ headers, set }) => {
            const apiKey = headers['x-api-key']
            if (!apiKey || typeof apiKey !== 'string') {
                set.status = 401
                return { error: 'API key required' }
            }

            const keyRecord = await prisma.apiKey.findUnique({ where: { key: apiKey } })
            if (!keyRecord) {
                set.status = 401
                return { error: 'Invalid API key' }
            }

            return logs
        },
        {
            detail: {
                tags: ['Moderation'],
                summary: 'Get moderation logs',
                description: 'Returns the moderation logs. Requires API key.',
                parameters: [
                    {
                        name: 'x-api-key',
                        in: 'header',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Logs array',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { type: 'string' }
                                }
                            }
                        }
                    },
                    401: {
                        description: 'Unauthorized - API key required or invalid',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
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
