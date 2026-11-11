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
  category?: 'stationery' | 'books' | 'fashion';
  author?: string;
  sampleReadSlug?: string;
  isBook?: boolean;
  salesCount?: number;
  rating?: number;
  tags?: string[];
  originalPriceVnd?: number;
  isFlashSale?: boolean;
  runwayLookIndex?: number;
}

export interface SampleChapter {
  id: number;
  chapterNumber: number;
  title: string;
  summary?: string;
  pages: string[][]; // array of pages, each page has paragraphs
}

export interface SampleBook {
  slug: string;
  title: string;
  subtitle?: string;
  author: string;
  category: string;
  publishedYear: number;
  synopsis: string;
  coverUrl?: string;
  themeColor: string;
  bgColor: string;
  physicalProductId?: string;
  physicalProductPriceVnd?: number;
  licenseNote: string;
  chapters: SampleChapter[];
}

export interface BookmarkData {
  pageIndex: number;
  color?: string; // '#ffe46b' | '#a9e8ac' | '#ffc1d9' | '#b7d9ff'
  note?: string;
  createdAt: string;
}

export interface AudioTrack {
  id: string;
  name: string;
  artist?: string;
  url: string;
  isCustom?: boolean;
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
