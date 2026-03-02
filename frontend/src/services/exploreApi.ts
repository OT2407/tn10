import type { ExploreMode, FeedItem } from '../types/domain';

interface ExploreResponse {
  success: boolean;
  data: {
    items: Array<{
      itemId: string;
      title: string | null;
      category: string | null;
      sellerId: string | null;
      score: number;
      createdAt: string;
    }>;
    nextCursor: string | null;
  };
}

const API_BASE = '/api';

function authHeaders(token?: string): HeadersInit {
  if (!token) {
    return { 'content-type': 'application/json' };
  }
  return {
    'content-type': 'application/json',
    authorization: `Bearer ${token}`,
  };
}

export async function fetchExplore(token: string | undefined, limit: number, cursor?: string): Promise<ExploreResponse['data'] | null> {
  if (!token) {
    return null;
  }

  const qs = new URLSearchParams({ limit: String(limit) });
  if (cursor) {
    qs.set('cursor', cursor);
  }

  const response = await fetch(`${API_BASE}/explore?${qs.toString()}`, {
    method: 'GET',
    headers: authHeaders(token),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as ExploreResponse;
  if (!payload.success) {
    return null;
  }

  return payload.data;
}

export async function toggleLike(token: string | undefined, itemId: string): Promise<boolean> {
  if (!token) {
    return false;
  }
  const response = await fetch(`${API_BASE}/items/${itemId}/like`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  return response.ok;
}

export async function toggleSave(token: string | undefined, itemId: string): Promise<boolean> {
  if (!token) {
    return false;
  }
  const response = await fetch(`${API_BASE}/items/${itemId}/save`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  return response.ok;
}

export async function toggleFollow(token: string | undefined, designerId: string): Promise<boolean> {
  if (!token) {
    return false;
  }
  const response = await fetch(`${API_BASE}/users/${designerId}/follow`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  return response.ok;
}

export function applyMode(items: FeedItem[], mode: ExploreMode, followingIds: Set<string>): FeedItem[] {
  if (mode === 'FOLLOWING') {
    return items.filter((item) => followingIds.has(item.seller.id));
  }

  if (mode === 'TRENDING') {
    return [...items].sort((a, b) => (b.likes + b.saves) - (a.likes + a.saves));
  }

  if (mode === 'NEWEST') {
    return [...items].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }

  return items;
}
