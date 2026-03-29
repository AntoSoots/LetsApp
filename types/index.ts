export type SourceOrigin = 'estonia' | 'europe' | 'global';
export type SortCategory = 'cheapest' | 'best' | 'fastest';

export interface ProductResult {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  totalCost: number; // price + shipping + taxes
  shippingCost: number;
  estimatedDeliveryDays: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  purchaseUrl: string;
  seller: string;
  sellerReputation: 'verified' | 'trusted' | 'unknown';
  origin: SourceOrigin;
  isSecure: boolean;
  brand?: string;
  category: SortCategory;
}

export interface SearchRequest {
  id: string;
  textInput: string;
  imageBase64?: string;
  aiQuery: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  filters: SearchFilters;
  expoPushToken?: string;
}

export interface SearchFilters {
  origin: SourceOrigin[];
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  minRating?: number;
}

export interface SearchResults {
  requestId: string;
  aiQuery: string;
  cheapest: ProductResult[];
  best: ProductResult[];
  fastest: ProductResult[];
  completedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
