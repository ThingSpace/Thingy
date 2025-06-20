import OpenAI from 'openai';

const openai = new OpenAI();

export async function moderateContent(text: string): Promise<{
  flagged: boolean;
  reason?: string;
  reviewRequired?: boolean;
  scores: Record<string, number>;
  category: string;
}> {
  try {
    const moderation = await openai.moderations.create({ input: text });
    const result = moderation.results?.[0];
    if (!result) {
      return {
        flagged: false,
        reason: 'No moderation result returned.',
        reviewRequired: false,
        scores: {},
        category: ''
      };
    }

    // Extract scores and categories
    const scores = result.category_scores ?? {};
    const categories = result.categories ?? {};
    const flagged = !!result.flagged;
    const flaggedCategories = Object.entries(categories)
      .filter(([_, v]) => v)
      .map(([k]) => k);

    // If self-harm or related, require human review
    const sensitiveCategories = ['self-harm', 'self-harm/intent', 'self-harm/instructions'];
    const needsReview = flaggedCategories.some(cat =>
      sensitiveCategories.includes(cat)
    );

    if (needsReview) {
      return {
        flagged,
        reviewRequired: true,
        reason: `Sensitive content detected: ${flaggedCategories.join(', ')}`,
        scores,
        category: flaggedCategories.join(', ')
      };
    }

    if (flagged) {
      return {
        flagged: true,
        reviewRequired: false,
        reason: `Flagged by AI moderation: ${flaggedCategories.join(', ')}`,
        scores,
        category: flaggedCategories.join(', ')
      };
    }

    return {
      flagged: false,
      reviewRequired: false,
      scores,
      category: flaggedCategories.join(', ')
    };
  } catch (err) {
    return {
      flagged: false,
      reason: 'An error occurred',
      reviewRequired: false,
      scores: {},
      category: ''
    };
  }
}