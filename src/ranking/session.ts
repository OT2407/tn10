export interface SessionProfile {
  userId: string;
  viewedTags: Record<string, number>;
  viewedCategories: Record<string, number>;
  viewedDesigners: Record<string, number>;
}

const sessionStore = new Map<string, SessionProfile>();

export function getSession(userId: string): SessionProfile {
  if (!sessionStore.has(userId)) {
    sessionStore.set(userId, {
      userId,
      viewedTags: {},
      viewedCategories: {},
      viewedDesigners: {}
    });
  }
  return sessionStore.get(userId)!;
}

export function updateSession(
  userId: string,
  type: 'tag' | 'category' | 'designer',
  key: string
) {
  const session = getSession(userId);
  if (type === 'tag') session.viewedTags[key] = (session.viewedTags[key] || 0) + 1;
  if (type === 'category') session.viewedCategories[key] = (session.viewedCategories[key] || 0) + 1;
  if (type === 'designer') session.viewedDesigners[key] = (session.viewedDesigners[key] || 0) + 1;
}
