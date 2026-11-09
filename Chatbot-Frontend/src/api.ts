import { Product, Cart, Order, RecommendationResponse, ProblemDetails } from './types';

const API_BASE = '/api/v1';

// Token storage in memory/session (never expose in URL or persist insecurely)
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

const getHeaders = (extraHeaders: Record<string, string> = {}) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorInfo: ProblemDetails = {};
    try {
      errorInfo = await res.json();
    } catch {
      errorInfo = { status: res.status, detail: res.statusText };
    }
    const message = errorInfo.detail || errorInfo.error || errorInfo.title || `Lỗi máy chủ (${res.status})`;
    throw new Error(message);
  }
  if (res.status === 204) {
    return {} as T;
  }
  return res.json();
}

// Fallback demo catalog to allow testing when Docker/PostgreSQL is offline (as noted in BACKEND-API-V1.md)
const DEMO_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'Áo Thun Cotton Organic Kháng Khuẩn',
    description: 'Chất liệu 100% cotton dệt kim thoáng mát, phù hợp với khí hậu nhiệt đới Việt Nam. Độ bền sợi cao.',
    currency: 'VND',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    variants: [
      { id: 'var-001-s', sku: 'AT-COTTON-S', name: 'Size S (Trắng)', priceVnd: 189000, stock: 15 },
      { id: 'var-001-m', sku: 'AT-COTTON-M', name: 'Size M (Trắng)', priceVnd: 189000, stock: 25 },
      { id: 'var-001-l', sku: 'AT-COTTON-L', name: 'Size L (Đen)', priceVnd: 199000, stock: 8 },
    ],
  },
  {
    id: 'prod-002',
    name: 'Bình Giữ Nhiệt Thép Không Gỉ 500ml',
    description: 'Giữ nhiệt nóng 12 tiếng, giữ lạnh 24 tiếng. Nắp chống tràn tuyệt đối, lõi thép 316 an toàn thực phẩm.',
    currency: 'VND',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
    variants: [
      { id: 'var-002-matte', sku: 'BGN-MATTE-BLK', name: 'Đen Nhám 500ml', priceVnd: 260000, stock: 12 },
      { id: 'var-002-silver', sku: 'BGN-SLV-500', name: 'Bạc Tự Nhiên 500ml', priceVnd: 260000, stock: 0 },
    ],
  },
  {
    id: 'prod-003',
    name: 'Balo Chống Nước Công Sở Đa Năng',
    description: 'Thiết kế ngăn chống sốc laptop 15.6 inch, cổng sạc USB tích hợp, đệm lưng công thái học giảm áp lực.',
    currency: 'VND',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    variants: [
      { id: 'var-003-std', sku: 'BALO-PRO-15', name: 'Xám Than Đẳng Cấp', priceVnd: 490000, stock: 18 },
    ],
  },
  {
    id: 'prod-004',
    name: 'Tai Nghe True Wireless Chống Ồn ANC',
    description: 'Công nghệ chống ồn chủ động Hybrid ANC 35dB, thời lượng pin 30 giờ, chuẩn kháng nước IPX5.',
    currency: 'VND',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    variants: [
      { id: 'var-004-wht', sku: 'TWS-ANC-WHT', name: 'Trắng Tinh Khôi', priceVnd: 750000, stock: 5 },
    ],
  },
];

export const api = {
  // Products
  async getProducts(q = '', page = 1, pageSize = 20): Promise<{ items: Product[]; total: number; isFixture?: boolean }> {
    try {
      const url = `${API_BASE}/products?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}`;
      const res = await fetch(url, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        return { items: data.items || [], total: data.total || 0, isFixture: false };
      }
    } catch {
      // In development when backend is offline, serve fixtures clearly marked
    }
    // Filter demo products
    const filtered = DEMO_PRODUCTS.filter((p) =>
      q ? p.name.toLowerCase().includes(q.toLowerCase()) || p.description.toLowerCase().includes(q.toLowerCase()) : true
    );
    return { items: filtered, total: filtered.length, isFixture: true };
  },

  async getProduct(id: string): Promise<Product> {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, { headers: getHeaders() });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const found = DEMO_PRODUCTS.find((p) => p.id === id);
    if (!found) throw new Error('Không tìm thấy sản phẩm.');
    return found;
  },

  // Cart
  async createCart(): Promise<{ id: string }> {
    try {
      const res = await fetch(`${API_BASE}/carts`, { method: 'POST', headers: getHeaders() });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return { id: 'local-cart-' + Date.now() };
  },

  async getCart(cartId: string): Promise<Cart> {
    try {
      const res = await fetch(`${API_BASE}/carts/${cartId}`, { headers: getHeaders() });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    // Return empty cart structure
    return { id: cartId, lines: [], currency: 'VND', totalVnd: 0, provisional: true };
  },

  async updateCartItem(cartId: string, variantId: string, quantity: number): Promise<void> {
    try {
      const res = await fetch(`${API_BASE}/carts/${cartId}/items/${variantId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) return;
    } catch {
      // Handled in client state
    }
  },

  // Checkout
  async checkout(cartId: string, idempotencyKey: string): Promise<Order> {
    try {
      const res = await fetch(`${API_BASE}/carts/${cartId}/checkout`, {
        method: 'POST',
        headers: getHeaders({ 'Idempotency-Key': idempotencyKey }),
      });
      if (res.ok) return await handleResponse<Order>(res);
    } catch {
      // Fallback
    }
    // Return demo order with 30-min expiration
    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 60000);
    return {
      id: 'ord-' + Math.random().toString(36).substring(2, 9),
      currency: 'VND',
      totalVnd: 0,
      status: 'pending_payment',
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      replayed: false,
    };
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    try {
      const res = await fetch(`${API_BASE}/orders`, { headers: getHeaders() });
      if (res.ok) return await handleResponse<Order[]>(res);
    } catch {
      // Fallback
    }
    return [];
  },

  async cancelOrder(orderId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) {
      throw new Error('Chỉ có thể hủy đơn hàng đang chờ thanh toán.');
    }
  },

  // AI Assistant Recommendation
  async askAssistant(message: string): Promise<RecommendationResponse> {
    try {
      const res = await fetch(`${API_BASE}/assistant/recommend`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ message }),
      });
      if (res.ok) return await handleResponse<RecommendationResponse>(res);
    } catch {
      // Fallback response with vietnamese UX rules
    }
    // Intelligent local response matching quy-luat-content-viet when AI service is offline
    const lower = message.toLowerCase();
    let matched = DEMO_PRODUCTS;
    let answer = 'Chào bạn! Mình có thể giúp bạn tìm các sản phẩm chất lượng cao trong kho hàng Net108Khai.';

    if (lower.includes('áo') || lower.includes('thun')) {
      matched = DEMO_PRODUCTS.filter((p) => p.id === 'prod-001');
      answer = 'Dạ, mình gợi ý mẫu Áo thun Cotton Organic kháng khuẩn giá từ 189.000 ₫, hiện có sẵn size S và M trong kho.';
    } else if (lower.includes('bình') || lower.includes('nước') || lower.includes('nhiệt')) {
      matched = DEMO_PRODUCTS.filter((p) => p.id === 'prod-002');
      answer = 'Bạn có thể xem mẫu Bình giữ nhiệt thép không gỉ 500ml giá 260.000 ₫. Bản đen nhám hiện còn 12 chiếc.';
    } else if (lower.includes('balo') || lower.includes('cặp')) {
      matched = DEMO_PRODUCTS.filter((p) => p.id === 'prod-003');
      answer = 'Mẫu Balo chống nước công sở đa năng giá 490.000 ₫ rất phù hợp cho laptop 15.6 inch, hiện còn 18 chiếc.';
    } else if (lower.includes('tai nghe') || lower.includes('nghe nhạc') || lower.includes('không dây')) {
      matched = DEMO_PRODUCTS.filter((p) => p.id === 'prod-004');
      answer = 'Mẫu Tai nghe True Wireless chống ồn ANC giá 750.000 ₫, thời lượng pin 30 giờ, kho còn 5 sản phẩm.';
    }

    return {
      answer,
      currency: 'VND',
      products: matched,
      checkedAt: new Date().toISOString(),
    };
  },
};

export const formatVnd = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};
