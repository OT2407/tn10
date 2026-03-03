export interface SessionProfile {
  userId: string;
  viewedTags: Record<string, number>;
  viewedCategories: Record<string, number>;
  viewedDesigners: Record<string, number>;
}

const sessionStore = new Map<string, SessionProfile>();

const MAX_SIGNAL = 5;       // cap per key
const DECAY_FACTOR = 0.9;   // soft decay per read

export function getSession(userId: string): SessionProfile {
  if (!sessionStore.has(userId)) {
    sessionStore.set(userId, {
      userId,
      viewedTags: {},
      viewedCategories: {},
      viewedDesigners: {}
    });
  }

  const session = sessionStore.get(userId)!;

  // Apply soft decay
  for (const map of [
    session.viewedTags,
    session.viewedCategories,
    session.viewedDesigners
  ]) {
    for (const key in map) {
      map[key] = (map[key] ?? 0) * DECAY_FACTOR;
    }
  }

  return session;
}

export function updateSession(
  userId: string,
  type: 'tag' | 'category' | 'designer',
  key: string
) {
  const session = getSession(userId);

  if (type === 'tag') {
    session.viewedTags[key] = Math.min(
      (session.viewedTags[key] || 0) + 1,
      MAX_SIGNAL
    );
  }

  if (type === 'category') {
    session.viewedCategories[key] = Math.min(
      (session.viewedCategories[key] || 0) + 1,
      MAX_SIGNAL
    );
  }

  if (type === 'designer') {
    session.viewedDesigners[key] = Math.min(
      (session.viewedDesigners[key] || 0) + 1,
      MAX_SIGNAL
    );
  }
}
