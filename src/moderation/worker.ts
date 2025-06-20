import { prisma } from '../config/prisma';
import { moderateContent } from '../utils/moderation';
import { Elysia } from 'elysia';

export const logs: string[] = [];
let currentStatus = 'idle';

export function log(message: string, status?: string) {
  const entry = `[${new Date().toISOString()}] ${message}`;
  logs.push(entry);
  if (logs.length > 1000) logs.shift();
  console.log(entry);
  if (status) currentStatus = status;
}

export function getStatus() {
  return currentStatus;
}

export async function runModerationCycle() {
  try {
    log('Moderation cycle: checking for all public posts', 'moderating posts');
    const posts = await prisma.post.findMany({
      where: { isPublished: true }
    });
    if (posts.length === 0) log('No public posts found. Service idle.', 'idle');
    for (const post of posts) {
      log(`Moderating post`, 'moderating posts');
      const result = await moderateContent(post.text);
      await prisma.post.update({
        where: { id: post.id },
        data: {
          isFlagged: result.reviewRequired ? false : result.flagged,
          needsReview: !!result.reviewRequired,
          flagReason: result.reason,
          moderationScores: JSON.stringify(result.scores)
        }
      });
      if (result.reviewRequired) {
        log(`Post ${post.id} requires review: reason=${result.reason}, category=${result.category}`);
      } else {
        log(`Post ${post.id} moderation result: flagged=${result.flagged}, reason=${result.reason}, category=${result.category}`);
      }
    }

    log('Moderation cycle: checking for all public journals', 'moderating journals');
    const journals = await prisma.journal.findMany({
      where: { isPublic: true }
    });
    if (journals.length === 0) log('No public journals found.', 'idle');
    for (const journal of journals) {
      log(`Moderating journal`, 'moderating journals');
      const result = await moderateContent(journal.title);
      await prisma.journal.update({
        where: { id: journal.id },
        data: {
          isFlagged: result.reviewRequired ? false : result.flagged,
          needsReview: !!result.reviewRequired,
          flagReason: result.reason,
          moderationScores: JSON.stringify(result.scores),
        }
      });
      if (result.reviewRequired) {
        log(`Journal ${journal.id} requires review: reason=${result.reason}, category=${result.category}`);
      } else {
        log(`Journal ${journal.id} moderation result: flagged=${result.flagged}, reason=${result.reason}, category=${result.category}`);
      }
    }

    log('Moderation cycle: checking for all public journal entries', 'moderating entries');
    const entries = await prisma.entry.findMany({
      where: { journal: { isPublic: true } },
      include: { journal: true }
    });
    if (entries.length === 0) log('No public journal entries found.', 'idle');
    for (const entry of entries) {
      log(`Moderating entry`, 'moderating entries');
      const result = await moderateContent(entry.text);
      await prisma.entry.update({
        where: { id: entry.id },
        data: {
          isFlagged: result.reviewRequired ? false : result.flagged,
          needsReview: !!result.reviewRequired,
          flagReason: result.reason,
          moderationScores: JSON.stringify(result.scores),
        }
      });
      if (result.reviewRequired) {
        log(`Entry ${entry.id} requires review: reason=${result.reason}, category=${result.category}`);
      } else {
        log(`Entry ${entry.id} moderation result: flagged=${result.flagged}, reason=${result.reason}, category=${result.category}`);
      }
    }
  } catch (err) {
    log(`Background moderation error: ${err instanceof Error ? err.message : String(err)}`, 'error');
  }
  log('Moderation cycle complete. Idling for 10 minutes.', 'idle');
}

export const moderationWorker = () =>
  new Elysia({ name: 'moderation-worker' }).onStart(() => {
    runModerationCycle();
    log('Background moderation service started.');
    setInterval(runModerationCycle, 600_000);
  });
