export interface Wish {
  id: number;
  sender_name: string;
  message: string;
  wish_energy: string;
  star_type: string;
  one_word: string | null;
  is_anonymous: boolean;
  status: 'approved' | 'pending' | 'hidden';
  created_at: string;
}

export interface WishesResponse {
  wishes: Wish[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WishStats {
  totalWishes: number;
  anonymousWishes: number;
  energyCounts: Record<string, number>;
  starTypeCounts: Record<string, number>;
}

export interface CreateWishPayload {
  sender_name: string;
  message: string;
  wish_energy: string;
  star_type: string;
  one_word?: string | null;
  is_anonymous: boolean;
}
