import { Wish, WishesResponse, WishStats, CreateWishPayload } from '../types.ts';

export async function fetchWishes(params: {
  page?: number;
  limit?: number;
  energy?: string;
  search?: string;
}): Promise<WishesResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page.toString());
  if (params.limit) query.set('limit', params.limit.toString());
  if (params.energy && params.energy !== 'all') query.set('energy', params.energy);
  if (params.search && params.search.trim()) query.set('search', params.search.trim());

  const res = await fetch(`/api/wishes?${query.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch wishes');
  }
  return res.json();
}

export async function fetchStats(): Promise<WishStats> {
  const res = await fetch('/api/wishes/stats');
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch statistics');
  }
  return res.json();
}

export async function fetchRandomWish(): Promise<Wish> {
  const res = await fetch('/api/wishes/random');
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'No wishes available at this moment');
  }
  const data = await res.json();
  return data.wish;
}

export async function fetchWishById(id: number): Promise<Wish> {
  const res = await fetch(`/api/wishes/${id}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'This star seems to have drifted away.');
  }
  const data = await res.json();
  return data.wish;
}

export async function submitWish(payload: CreateWishPayload): Promise<{ message: string; wish: Wish }> {
  const res = await fetch('/api/wishes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Your star could not take off this time. Please try again.');
  }
  return res.json();
}

export async function deleteWishApi(id: number): Promise<void> {
  const res = await fetch(`/api/wishes/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to remove star');
  }
}
