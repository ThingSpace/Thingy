import { Elysia } from 'elysia';
import { getStatus } from '../moderation/worker';

export const stateRoute = (app: Elysia) =>
  app.get(
    '/state',
    () => ({ status: getStatus() }),
    {
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
    }
  );
