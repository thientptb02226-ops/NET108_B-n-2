import { Product, Cart, Order, RecommendationResponse, ProblemDetails, SampleBook } from './types';
import { SAMPLE_BOOKS_FIXTURE } from './data/sampleBooksData';

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

// Net108Khai Catalog: Đồ dùng học tập và sách giấy có bản đọc thử mẫu
const DEMO_PRODUCTS: Product[] = [
  // --- NHÓM 1: SÁCH GIẤY (CÓ BẢN ĐỌC THỬ MẪU) ---
  {
    id: 'book-001',
    name: 'Sách: Tôi Thấy Hoa Vàng Trên Cỏ Xanh (Bìa Cứng Kỷ Niệm)',
    description: 'Ấn bản đặc biệt kỷ niệm với tranh minh họa màu, bìa cứng dập nổi sang trọng. Khổ 14x20.5cm, 378 trang giấy ngà vàng dịu mắt.',
    currency: 'VND',
    category: 'books',
    isBook: true,
    author: 'Nguyễn Nhật Ánh',
    sampleReadSlug: 'toi-thay-hoa-vang-tren-co-xanh',
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop&q=80',
    salesCount: 1420,
    rating: 4.9,
    tags: ['Freeship Extra', 'Bán chạy #1', 'Đọc thử 3D'],
    originalPriceVnd: 155000,
    isFlashSale: true,
    variants: [
      { id: 'var-b01-hard', sku: 'BOOK-HOAVANG-HC', name: 'Bìa Cứng Kỷ Niệm', priceVnd: 125000, stock: 35 },
      { id: 'var-b01-soft', sku: 'BOOK-HOAVANG-SC', name: 'Bìa Mềm Tiêu Chuẩn', priceVnd: 95000, stock: 50 },
    ],
  },
  {
    id: 'book-002',
    name: 'Sách: Cho Tôi Xin Một Vé Đi Tuổi Thơ',
    description: 'Tác phẩm đạt Giải thưởng Văn học ASEAN. Chuyến tàu đưa người đọc trở về những năm tháng ngây ngô trong trẻo nhất của tuổi thơ.',
    currency: 'VND',
    category: 'books',
    isBook: true,
    author: 'Nguyễn Nhật Ánh',
    sampleReadSlug: 'cho-toi-xin-mot-ve-di-tuoi-tho',
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80',
    salesCount: 890,
    rating: 4.8,
    tags: ['Top deal', 'Tuổi thơ', 'Đọc thử 3D'],
    originalPriceVnd: 135000,
    variants: [
      { id: 'var-b02-std', sku: 'BOOK-VETUOITHO', name: 'Ấn Bản Bìa Mềm', priceVnd: 110000, stock: 28 },
    ],
  },
  {
    id: 'book-003',
    name: 'Sách: Mắt Biếc (Tái Bản Kèm Tranh Minh Họa)',
    description: 'Tuyệt phẩm viết về tình yêu đầu đời thuần khiết và nỗi hoài niệm làng Đo Đo mùa hoa sim tím nở rộ.',
    currency: 'VND',
    category: 'books',
    isBook: true,
    author: 'Nguyễn Nhật Ánh',
    sampleReadSlug: 'mat-biec',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
    salesCount: 2150,
    rating: 5.0,
    tags: ['Freeship', 'Kèm tranh màu', 'Đọc thử 3D'],
    originalPriceVnd: 145000,
    isFlashSale: true,
    variants: [
      { id: 'var-b03-std', sku: 'BOOK-MATBIEC', name: 'Bìa Mềm Minh Họa', priceVnd: 115000, stock: 40 },
    ],
  },
  {
    id: 'book-004',
    name: 'Sách: Dế Mèn Phiêu Lưu Ký (Tuyển Tập Kinh Điển)',
    description: 'Tác phẩm văn học thiếu nhi kinh điển của Tô Hoài. Ấn bản minh họa độc quyền cho học sinh và độc giả trẻ.',
    currency: 'VND',
    category: 'books',
    isBook: true,
    author: 'Tô Hoài',
    sampleReadSlug: 'de-men-phieu-luu-ky',
    imageUrl: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=800&auto=format&fit=crop&q=80',
    salesCount: 640,
    rating: 4.8,
    tags: ['Kinh điển', 'Tô Hoài', 'Đọc thử 3D'],
    originalPriceVnd: 110000,
    variants: [
      { id: 'var-b04-std', sku: 'BOOK-DEMEN', name: 'Bản Minh Họa Màu', priceVnd: 85000, stock: 65 },
    ],
  },
  {
    id: 'book-005',
    name: 'Sách: Sổ Tay Phương Pháp Tự Học Dành Cho Gen Z',
    description: 'Cẩm nang thực chiến kết hợp kỹ thuật Pomodoro, Feynman, Mindmap và ứng dụng công cụ AI để học tập chủ động.',
    currency: 'VND',
    category: 'books',
    isBook: true,
    author: 'Ban Học Thuật Net108Khai',
    sampleReadSlug: 'phuong-phap-tu-hoc-gen-z',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
    salesCount: 1800,
    rating: 4.9,
    tags: ['Gen Z Hot', 'Kèm Template AI', 'Đọc thử 3D'],
    originalPriceVnd: 120000,
    isFlashSale: true,
    variants: [
      { id: 'var-b05-std', sku: 'BOOK-TUHOC-GENZ', name: 'Sách Kèm Bộ Template', priceVnd: 95000, stock: 22 },
    ],
  },
  {
    id: 'book-006',
    name: 'Sách: Tư Duy Thuật Toán & Lập Trình Cơ Bản C#',
    description: 'Giáo trình thực hành lập trình hiện đại với C# và .NET 10. Hệ thống bài tập từ nhập môn đến giải thuật thực tế.',
    currency: 'VND',
    category: 'books',
    isBook: true,
    author: 'Ban Chuyên Môn CNTT FPT Polytechnic',
    sampleReadSlug: 'lap-trinh-tu-duy-thuat-toan',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    salesCount: 420,
    rating: 4.7,
    tags: ['C# .NET 10', 'Bản quyền FPT', 'Đọc thử 3D'],
    originalPriceVnd: 190000,
    variants: [
      { id: 'var-b06-std', sku: 'BOOK-THUATTOAN-CS', name: 'Bản Bìa Cứng Chuyên Ngành', priceVnd: 150000, stock: 15 },
    ],
  },

  // --- NHÓM 2: ĐỒ DÙNG HỌC TẬP & VĂN PHÒNG PHẨM ---
  {
    id: 'stat-001',
    name: 'Balo Học Sinh / Sinh Viên Chống Gù & Chống Nước Net108 Pro',
    description: 'Đệm lưng công thái học giảm 40% áp lực cột sống. Vải Oxford 900D chống thấm nước, ngăn chống sốc laptop 15.6 inch.',
    currency: 'VND',
    category: 'stationery',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    salesCount: 950,
    rating: 4.9,
    tags: ['Freeship', 'Chống gù 40%', 'Vải Oxford'],
    originalPriceVnd: 490000,
    isFlashSale: true,
    variants: [
      { id: 'var-s01-blk', sku: 'BALO-PRO-BLK', name: 'Đen Nhám Học Đường', priceVnd: 380000, stock: 18 },
      { id: 'var-s01-gry', sku: 'BALO-PRO-GRY', name: 'Xám Khói Thời Trang', priceVnd: 380000, stock: 12 },
    ],
  },
  {
    id: 'stat-002',
    name: 'Bộ Bút Gel Mực Đen & Bút Dạ Quang Pastel (Hộp 12 Cây)',
    description: 'Mực gel nhanh khô không lem, đầu ngòi 0.5mm êm ái. Tặng kèm 4 bút dạ quang pastel chống mỏi mắt khi học lâu.',
    currency: 'VND',
    category: 'stationery',
    imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&auto=format&fit=crop&q=80',
    salesCount: 3820,
    rating: 4.9,
    tags: ['Bán chạy #1', 'Pastel Cute', '12 Cây'],
    originalPriceVnd: 85000,
    isFlashSale: true,
    variants: [
      { id: 'var-s02-set', sku: 'BUT-SET-12', name: 'Hộp 12 Cây (8 Gel + 4 Pastel)', priceVnd: 65000, stock: 85 },
    ],
  },
  {
    id: 'stat-003',
    name: 'Sổ Tay Kẻ Ngang Bìa Da Cao Cấp A5 (200 Trang Chống Lóa)',
    description: 'Bìa da PU mềm mại chống thấm nước. Giấy ngà vàng định lượng 100gsm viết bút mực không thấm mặt sau.',
    currency: 'VND',
    category: 'stationery',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    salesCount: 1200,
    rating: 4.8,
    tags: ['Giấy ngà 100gsm', 'Bìa Da PU'],
    originalPriceVnd: 99000,
    variants: [
      { id: 'var-s03-brn', sku: 'SO-A5-BROWN', name: 'Nâu Cổ Điển', priceVnd: 75000, stock: 45 },
      { id: 'var-s03-blu', sku: 'SO-A5-BLUE', name: 'Xanh Navy Trầm', priceVnd: 75000, stock: 30 },
    ],
  },
  {
    id: 'stat-004',
    name: 'Đèn Bàn LED Chống Cận Thị 3 Chế Độ Sáng Cảm Ứng',
    description: 'Chỉ số hoàn màu CRI > 95 tái tạo ánh sáng tự nhiên. 3 mức nhiệt độ màu (trắng, trung tính, vàng) bảo vệ thị lực tuyệt đối.',
    currency: 'VND',
    category: 'stationery',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
    salesCount: 530,
    rating: 4.9,
    tags: ['CRI > 95', 'Bảo vệ mắt'],
    originalPriceVnd: 320000,
    variants: [
      { id: 'var-s04-wht', sku: 'DEN-LED-WHT', name: 'Trắng Thanh Lịch', priceVnd: 245000, stock: 20 },
    ],
  },
  {
    id: 'stat-005',
    name: 'Hộp Bút Canvas Nhiều Ngăn Phân Loại Đồ Dùng Học Tập',
    description: 'Chất liệu vải canvas dệt dày dặn, khóa kéo kim loại bền bỉ. Thiết kế 3 khoang chứa rộng rãi để bút, thước kẻ, máy tính.',
    currency: 'VND',
    category: 'stationery',
    imageUrl: 'https://images.unsplash.com/photo-1585336261026-77884d5f2f53?w=800&auto=format&fit=crop&q=80',
    salesCount: 2600,
    rating: 4.9,
    tags: ['Canvas pastel', 'Dung tích lớn'],
    originalPriceVnd: 60000,
    isFlashSale: true,
    variants: [
      { id: 'var-s05-grn', sku: 'HBUT-CANVAS-GRN', name: 'Xanh Bạc Hà', priceVnd: 45000, stock: 60 },
      { id: 'var-s05-bei', sku: 'HBUT-CANVAS-BEI', name: 'Màu Be Vintage', priceVnd: 45000, stock: 40 },
    ],
  },
  {
    id: 'stat-006',
    name: 'Máy Tính Khoa Học Cầm Tay Fx-580 Net108 Chuyên Dụng',
    description: 'Tốc độ xử lý siêu nhanh 552 tính năng, màn hình LCD độ phân giải cao hiển thị tiếng Việt chuẩn thi THPT quốc gia.',
    currency: 'VND',
    category: 'stationery',
    imageUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80',
    salesCount: 780,
    rating: 5.0,
    tags: ['Thi THPT Quốc Gia', '552 Tính năng'],
    originalPriceVnd: 690000,
    variants: [
      { id: 'var-s06-std', sku: 'CAS-FX580-NET', name: 'Bản Đen Tiêu Chuẩn', priceVnd: 580000, stock: 15 },
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
    let answer = 'Chào bạn! Mình có thể giúp bạn tìm sách giáo khoa, sách văn học và đồ dùng học tập chất lượng cao tại Net108Khai.';

    if (lower.includes('sách') || lower.includes('hoa vàng') || lower.includes('nguyễn nhật ánh') || lower.includes('đọc')) {
      matched = DEMO_PRODUCTS.filter((p) => p.isBook);
      answer = 'Dạ, Net108Khai hiện có sẵn các tựa sách hay của nhà văn Nguyễn Nhật Ánh, Tô Hoài và sách phương pháp tự học. Bạn có thể nhấn "Xem sách" để đọc thử trực tuyến trước khi mua nhé!';
    } else if (lower.includes('balo') || lower.includes('cặp')) {
      matched = DEMO_PRODUCTS.filter((p) => p.id === 'stat-001');
      answer = 'Mẫu Balo chống gù Net108 Pro giá 380.000 ₫ rất phù hợp cho học sinh, sinh viên, đệm lưng êm ái và có ngăn laptop 15.6 inch.';
    } else if (lower.includes('bút') || lower.includes('viết')) {
      matched = DEMO_PRODUCTS.filter((p) => p.id === 'stat-002');
      answer = 'Bộ bút gel mực đen kèm dạ quang Pastel 12 cây giá chỉ 65.000 ₫, mực khô nhanh chống lem rất được ưa chuộng.';
    } else if (lower.includes('sổ') || lower.includes('vở')) {
      matched = DEMO_PRODUCTS.filter((p) => p.id === 'stat-003');
      answer = 'Mẫu Sổ tay A5 bìa da cao cấp 200 trang chống lóa giá 75.000 ₫, giấy dầy không thấm mực ra trang sau.';
    } else if (lower.includes('đèn') || lower.includes('cận')) {
      matched = DEMO_PRODUCTS.filter((p) => p.id === 'stat-004');
      answer = 'Đèn bàn LED chống cận thị 3 chế độ sáng cảm ứng giá 245.000 ₫, chỉ số hoàn màu CRI > 95 bảo vệ mắt tối đa.';
    } else if (lower.includes('máy tính') || lower.includes('fx')) {
      matched = DEMO_PRODUCTS.filter((p) => p.id === 'stat-006');
      answer = 'Máy tính khoa học Fx-580 Net108 giá 580.000 ₫ đầy đủ 552 tính năng, chuẩn quy định phòng thi.';
    }

    return {
      answer,
      currency: 'VND',
      products: matched,
      checkedAt: new Date().toISOString(),
    };
  },

  // Reading API (Hợp đồng C05.5: Sample Reading Service)
  async getSampleBooks(): Promise<{ items: SampleBook[]; isFixture: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/reading/books`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        return { items: data.items || data, isFixture: false };
      }
    } catch {
      // In development when backend is offline, serve sample reading fixture
    }
    return { items: SAMPLE_BOOKS_FIXTURE, isFixture: true };
  },

  async getSampleBook(slug: string): Promise<{ book: SampleBook; isFixture: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/reading/books/${slug}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        return { book: data, isFixture: false };
      }
    } catch {
      // Fallback to fixture
    }
    const found = SAMPLE_BOOKS_FIXTURE.find((b) => b.slug === slug);
    if (!found) throw new Error(`Không tìm thấy bản đọc mẫu cho tác phẩm "${slug}".`);
    return { book: found, isFixture: true };
  },
};

export const formatVnd = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};
