export interface UserPreference {
  userId: string;
  likedTags: Record<string, number>;
  likedCategories: Record<string, number>;
  followedDesigners: Record<string, number>;
}

const preferenceStore = new Map<string, UserPreference>();

export function getPreference(userId: string): UserPreference {
  return (
    preferenceStore.get(userId) || {
      userId,
      likedTags: {},
      likedCategories: {},
      followedDesigners: {},
    }
  );
}

export function updatePreference(
  userId: string,
  type: 'tag' | 'category' | 'designer',
  key: string,
  delta: number
): void {
  const pref = getPreference(userId);

  if (type === 'tag') pref.likedTags[key] = (pref.likedTags[key] || 0) + delta;
  if (type === 'category') pref.likedCategories[key] = (pref.likedCategories[key] || 0) + delta;
  if (type === 'designer') pref.followedDesigners[key] = (pref.followedDesigners[key] || 0) + delta;

  preferenceStore.set(userId, pref);
}