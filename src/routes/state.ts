import { Elysia } from 'elysia'
import { getStatus } from '../moderation/worker'

/**
 * Registers the moderation worker state route.
 * Returns the current status of the moderation worker.
 * @param {Elysia} app - The Elysia app instance.
 * @returns {Elysia}
 */
export const stateRoute = (app: Elysia) =>
    app.get('/state', () => ({ status: getStatus() }), {
        detail: {
            tags: ['Moderation'],
            summary: 'Get moderation worker status',
            description: 'Returns the current status of the moderation worker.',
            responses: {
                200: {
                    description: 'Status object',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
