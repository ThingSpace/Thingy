import { Elysia } from 'elysia';
import { prisma } from '../config/prisma';

export const resultRoute = (app: Elysia) =>
  app.get(
    '/result/:id',
    async ({ params, headers, set }) => {
      const apiKey = headers['x-api-key'];
      if (!apiKey || typeof apiKey !== 'string') {
        set.status = 401;
        return { error: 'API key required' };
      }

      const keyRecord = await prisma.apiKey.findUnique({ where: { key: apiKey } });
      if (!keyRecord) {
        set.status = 401;
        return { error: 'Invalid API key' };
      }

      // Get moderation details for a post or entry by ID
      const post = await prisma.post.findUnique({ where: { id: params.id } });
      if (post) {
        return {
          id: post.id,
          text: post.text,
          isFlagged: post.isFlagged,
          flagReason: post.flagReason,
          needsReview: post.needsReview,
          moderationScores: post.moderationScores,
        };
      }
      const entry = await prisma.entry.findUnique({ where: { id: params.id } });
      if (entry) {
        return {
          id: entry.id,
          text: entry.text,
          isFlagged: entry.isFlagged,
          flagReason: entry.flagReason,
          needsReview: entry.needsReview,
          moderationScores: entry.moderationScores,
        };
      }
      return { error: 'Not found' };
    },
    {
      detail: {
        tags: ['Moderation'],
        summary: 'Get moderation result by ID',
        description: 'Returns moderation details for a post or entry by ID. Requires API key.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          },
          {
            name: 'x-api-key',
            in: 'header',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: {
            description: 'Moderation result or error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    text: { type: 'string' },
                    isFlagged: { type: 'boolean' },
                    flagReason: { type: 'string' },
                    needsReview: { type: 'boolean' },
                    moderationScores: { type: 'object' },
                    error: { type: 'string' }
                  }
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
  );
