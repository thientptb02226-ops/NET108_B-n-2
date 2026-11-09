export interface Variant {
  id: string;
  sku: string;
  name: string;
  priceVnd: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  currency: string;
  variants: Variant[];
  imageUrl?: string;
}

export interface CartLine {
  productId?: string;
  variantId: string;
  sku: string;
  name: string;
  priceVnd: number;
  quantity: number;
}

export interface Cart {
  id: string;
  lines: CartLine[];
  currency: string;
  totalVnd: number;
  provisional: boolean;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  sku: string;
  name: string;
  unitPriceVnd: number;
  quantity: number;
}

export interface Order {
  id: string;
  currency: string;
  totalVnd: number;
  status: 'pending_payment' | 'cancelled' | 'expired' | 'completed';
  createdAt: string;
  expiresAt?: string;
  replayed?: boolean;
  items?: OrderItem[];
}

export interface RecommendationResponse {
  answer: string;
  currency: string;
  products: Product[];
  checkedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  products?: Product[];
  isLoading?: boolean;
  error?: string;
}

export interface ProblemDetails {
  title?: string;
  status?: number;
  detail?: string;
  error?: string;
}
