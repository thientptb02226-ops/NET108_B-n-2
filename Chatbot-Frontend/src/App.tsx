import React, { useState, useEffect } from 'react';
import { Product, Variant, CartLine, Order } from './types';
import { api, DEMO_PRODUCTS } from './api';
import { ProductCard } from './components/catalog/ProductCard';
import { ProductDetailModal } from './components/catalog/ProductDetailModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { OrderHistoryView } from './components/orders/OrderHistoryView';
import { AssistantChat } from './components/assistant/AssistantChat';
import { ProductCardSkeleton, ErrorState, EmptyState } from './components/common/FeedbackStates';
import {
  ShoppingBag,
  Search,
  Sparkles,
  Package,
  HeartHandshake,
  BookOpen,
  Camera,
  Flame,
  Zap,
  Gift,
  Truck,
  Palette,
  ArrowUp,
  MapPin,
  Heart,
  Headphones,
  CheckCircle,
  Clock,
  ChevronRight,
  User,
} from 'lucide-react';
import { KhoaverseLibraryView } from './components/reader/KhoaverseLibraryView';
import { ReelCarouselHero } from './components/hero/ReelCarouselHero';

export const App: React.FC = () => {
  // Path-based routing: '/' (Commerce) vs '/read' or '/read/:slug' (Reading Space)
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');

  // Handle URL change without full page reload
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigation tabs inside Commerce
  const [activeTab, setActiveTab] = useState<'catalog' | 'assistant' | 'orders'>('catalog');
  const [catalogFilter, setCatalogFilter] = useState<'all' | 'stationery' | 'books' | 'flash' | 'bestseller'>('all');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<'all' | 'books' | 'stationery'>('all');
  const [isImageSearchOpen, setIsImageSearchOpen] = useState(false);

  // Products state - prefilled with DEMO_PRODUCTS for instantaneous instant render
  const [products, setProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  // Cart state
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Runway 3D Lookbook state
  const [activeRunwayLook, setActiveRunwayLook] = useState<number | null>(null);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Listen to postMessage from Runway Lookbook iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'CLOSE_RUNWAY') {
        setActiveRunwayLook(null);
      }
      if (e.data?.type === 'RUNWAY_ADD_TO_CART') {
        const { name, price } = e.data;
        const numPrice = parseInt(String(price).replace(/[^0-9]/g, ''), 10) || 1000;
        const priceVnd = numPrice * 25400; // ~$1 = 25,400 VND
        setCartLines((prev) => [
          ...prev,
          {
            variantId: `mv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            sku: `MV-${String(name).toUpperCase().replace(/\s+/g, '-')}`,
            name: `Maison Vell — ${name}`,
            priceVnd,
            quantity: 1,
          },
        ]);
        setIsCartOpen(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Gamification state: coins & daily check-in
  const [coins, setCoins] = useState(850);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);

  // Flash Sale countdown timer simulation
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 3, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch products (Stale-while-revalidate: keep initial products displayed without flashing skeleton)
  const fetchProducts = async (q = '') => {
    if (!products || products.length === 0) {
      setIsLoadingProducts(true);
    }
    setProductError(null);
    try {
      const res = await api.getProducts(q);
      setProducts(res.items);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải danh sách sản phẩm.';
      if (!products || products.length === 0) {
        setProductError(msg);
      }
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts(searchQuery);
  }, [searchQuery]);

  // Cart actions
  const handleAddToCart = (variant: Variant, quantity: number) => {
    setCartLines((prev) => {
      const existing = prev.find((l) => l.variantId === variant.id);
      if (existing) {
        return prev.map((l) =>
          l.variantId === variant.id ? { ...l, quantity: l.quantity + quantity } : l
        );
      }
      return [
        ...prev,
        {
          variantId: variant.id,
          sku: variant.sku,
          name: `${selectedProduct?.name || 'Sản phẩm'} - ${variant.name}`,
          priceVnd: variant.priceVnd,
          quantity,
        },
      ];
    });
  };

  const handleUpdateQuantity = (variantId: string, delta: number) => {
    setCartLines((prev) =>
      prev
        .map((l) => (l.variantId === variantId ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0)
    );
  };

  const handleRemoveItem = (variantId: string) => {
    setCartLines((prev) => prev.filter((l) => l.variantId !== variantId));
  };

  const totalCartVnd = cartLines.reduce((sum, l) => sum + l.priceVnd * l.quantity, 0);
  const totalCartItems = cartLines.reduce((sum, l) => sum + l.quantity, 0);

  const handleOrderSuccess = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    setCartLines([]);
  };

  // Filter products by selected category
  const filteredProducts = products.filter((p) => {
    if (catalogFilter === 'stationery') return p.category === 'stationery';
    if (catalogFilter === 'books') return p.category === 'books';
    if (catalogFilter === 'flash') return !!p.isFlashSale;
    if (catalogFilter === 'bestseller') return (p.salesCount || 0) > 1000;
    return true;
  });

  const flashSaleProducts = products.filter((p) => p.isFlashSale).slice(0, 3);

  // Check if current route is /read or /read/:slug
  const isReadingRoute = currentPath.startsWith('/read');
  const readSlug = currentPath.startsWith('/read/')
    ? decodeURIComponent(currentPath.replace('/read/', '').trim())
    : null;

  // ROUTE 1: KHOAVERSE READING SPACE (/read or /read/:slug)
  if (isReadingRoute) {
    return (
      <KhoaverseLibraryView
        initialSlug={readSlug}
        onBackToStore={() => navigateTo('/')}
        onBuyBook={(productId) => {
          navigateTo('/');
          if (productId) {
            const p = products.find((prod) => prod.id === productId || prod.name.includes(productId));
            if (p) setSelectedProduct(p);
          }
        }}
      />
    );
  }

  // Hot Search Keywords (Taobao Trend Tags)
  const hotSearchKeywords = [
    'Bút pastel 12 cây',
    'Tôi Thấy Hoa Vàng',
    'Balo chống gù',
    'Mắt Biếc',
    'Sổ tay còng A5',
    'Đèn LED chống cận',
    'Hộp bút canvas',
  ];

  // ROUTE 2: COMMERCE STORE (TAOBAO ARCHITECTURE + KHOAVERSE ARCHIVAL HARMONIZED PALETTE)
  return (
    <div className="min-h-screen flex flex-col bg-[#EDEBE6] text-[#141414] font-sans selection:bg-[#1F3FB0]/20 selection:text-[#1F3FB0] relative overflow-x-hidden w-full max-w-full">
      {/* KhoaVerse Paper Grain Texture Overlay */}
      <div className="grain" aria-hidden="true" />

      {/* 1. TOP UTILITY BAR (Taobao Style with KhoaVerse Archival Tones) */}
      <div className="bg-[#E5E2DC] border-b border-black/10 text-[11px] text-[#6D6A63] py-1.5 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-medium text-[#141414]">
              <MapPin className="w-3.5 h-3.5 text-[#1F3FB0]" /> Giao tới: TP. Hồ Chí Minh
            </span>
            <span className="hidden sm:inline text-black/20">|</span>
            <span className="hidden sm:inline text-[#6D6A63] font-medium">
              Chào mừng bạn đến với <b className="text-[#141414] font-bold">Net108Khai Book & Stationery Mall</b>
            </span>
          </div>
          <div className="flex items-center gap-3.5 font-medium">
            <button
              onClick={() => setActiveTab('orders')}
              className="hover:text-[#1F3FB0] flex items-center gap-1 transition-colors"
            >
              <Package className="w-3 h-3 text-[#6D6A63]" /> Đơn hàng của tôi
            </button>
            <button
              onClick={() => navigateTo('/read')}
              className="hover:text-[#18328C] flex items-center gap-1 text-[#1F3FB0] font-bold transition-colors"
            >
              <BookOpen className="w-3 h-3" /> Kệ sách 3D
            </button>
            <button
              onClick={() => setActiveRunwayLook(0)}
              className="hover:text-black flex items-center gap-1 text-[#16191f] font-bold transition-colors cursor-pointer"
            >
              👗 Sàn diễn 3D Runway
            </button>
            <span className="hidden md:flex items-center gap-1 hover:text-[#1F3FB0] cursor-pointer">
              <Headphones className="w-3 h-3 text-[#6D6A63]" /> CSKH 24/7
            </span>
          </div>
        </div>
      </div>

      {/* 2. MEGA SEARCH BAND (Taobao Style with KhoaVerse Deep Ink & Cobalt Accents) */}
      <header className="bg-[#F4F2ED]/95 backdrop-blur-md sticky top-0 z-40 border-b border-black/10 shadow-[0_4px_20px_-8px_rgba(20,20,20,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <button
              onClick={() => {
                setActiveTab('catalog');
                setCatalogFilter('all');
                navigateTo('/');
              }}
              className="flex items-center gap-3 group text-left"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#141414] text-white flex items-center justify-center font-serif shadow-sm group-hover:bg-[#1F3FB0] transition-colors">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-[#141414] group-hover:text-[#1F3FB0] transition-colors leading-none flex items-center gap-1.5">
                  Net108Khai
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white text-[#1F3FB0] border border-[#1F3FB0]/25">
                    Mall
                  </span>
                </span>
                <span className="text-[10px] text-[#6D6A63] tracking-widest block font-medium mt-0.5 uppercase">
                  VĂN PHÒNG PHẨM · SÁCH CHÍNH HÃNG
                </span>
              </div>
            </button>

            {/* Mobile Cart Button (Icon only) */}
            <div className="md:hidden flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative w-10 h-10 rounded-xl bg-white text-[#141414] flex items-center justify-center border border-black/15 shadow-xs active:scale-95"
                aria-label="Giỏ hàng"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-[#1F3FB0] text-white font-bold text-[10px] flex items-center justify-center">
                    {totalCartItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Central Mega Search Bar (Taobao Style with Snap-to-Search Camera) */}
          <div className="w-full md:max-w-2xl flex flex-col gap-1.5">
            {/* Search Category Tabs */}
            <div className="flex items-center gap-3 px-1 text-xs font-bold text-[#6D6A63]">
              <button
                onClick={() => setSearchCategory('all')}
                className={`pb-0.5 transition-colors ${searchCategory === 'all' ? 'text-[#1F3FB0] border-b-2 border-[#1F3FB0]' : 'hover:text-[#141414]'}`}
              >
                Tất cả sản phẩm
              </button>
              <button
                onClick={() => setSearchCategory('books')}
                className={`pb-0.5 transition-colors ${searchCategory === 'books' ? 'text-[#1F3FB0] border-b-2 border-[#1F3FB0]' : 'hover:text-[#141414]'}`}
              >
                Sách & Truyện
              </button>
              <button
                onClick={() => setSearchCategory('stationery')}
                className={`pb-0.5 transition-colors ${searchCategory === 'stationery' ? 'text-[#1F3FB0] border-b-2 border-[#1F3FB0]' : 'hover:text-[#141414]'}`}
              >
                Văn phòng phẩm
              </button>
            </div>

            {/* Big Search Input Box */}
            <div className="relative flex items-center">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm bút pastel, balo chống gù, truyện Nguyễn Nhật Ánh..."
                  className="w-full bg-white border-2 border-black/15 focus:border-[#1F3FB0] focus:bg-white rounded-full pl-5 pr-20 py-2.5 text-sm text-[#141414] focus:outline-none transition-all placeholder-[#6D6A63]/60 shadow-xs"
                />
                {/* Camera Snap-to-Search (拍立淘 Taobao Feature) */}
                <button
                  type="button"
                  onClick={() => setIsImageSearchOpen(true)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6D6A63] hover:text-[#1F3FB0] transition-colors p-1"
                  title="Tìm kiếm bằng hình ảnh (Snap to search)"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Main Search Button */}
              <button
                type="button"
                onClick={() => fetchProducts(searchQuery)}
                className="ml-2 px-6 py-2.5 rounded-full bg-[#1F3FB0] hover:bg-[#18328C] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#1F3FB0]/20 transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Tìm kiếm</span>
              </button>
            </div>

            {/* Hot Trend Search Keywords below search bar */}
            <div className="hidden sm:flex items-center gap-2 overflow-x-auto text-[11px] text-[#6D6A63] pt-0.5">
              <span className="text-[#1F3FB0] font-bold flex items-center gap-0.5 shrink-0">
                <Flame className="w-3 h-3 fill-current" /> Hot:
              </span>
              {hotSearchKeywords.map((kw) => (
                <button
                  key={kw}
                  onClick={() => setSearchQuery(kw)}
                  className="hover:text-[#1F3FB0] hover:underline whitespace-nowrap transition-colors"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Cart Button (Icon only with counter badge, exactly as requested) */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-white border border-black/15 text-[#141414] hover:border-[#1F3FB0] hover:text-[#1F3FB0] transition-all duration-200 shadow-xs active:scale-95 select-none"
              title={`Giỏ hàng (${totalCartItems} món)`}
              aria-label="Giỏ hàng"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#1F3FB0] text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2.5. REEL CAROUSEL HERO SHOWCASE (NẰM DƯỚI MENU HEADER) */}
      <ReelCarouselHero />

      {/* 3. CORE TRIANGLE HERO SECTION (Taobao 3-Column Standard Layout with KhoaVerse Style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* CỘT 1: MEGA CATEGORY MENU (Trái: 3/12 ~ 25%) */}
          <div className="lg:col-span-3 bg-[#F4F2ED] rounded-3xl p-4 border border-black/10 shadow-[0_10px_30px_-5px_rgba(20,20,20,0.04)] flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-black/10">
                <span className="lbl-khoa text-[#1F3FB0] flex items-center gap-1.5 font-bold">
                  <Palette className="w-4 h-4" /> Danh mục ngành hàng
                </span>
              </div>
              {[
                { label: 'Bút viết & Mực văn phòng', desc: 'Bút gel, bút dạ quang, bút chì kim', cat: 'stationery' },
                { label: 'Sách giấy & Truyện kinh điển', desc: 'Nguyễn Nhật Ánh, văn học thiếu nhi', cat: 'books' },
                { label: 'Balo & Túi chống gù', desc: 'Chống thấm nước, quai đeo trợ lực', cat: 'stationery' },
                { label: 'Sổ tay, Vở & Giấy note', desc: 'Giấy kẻ ngang chống lóa, bìa cứng', cat: 'stationery' },
                { label: 'Dụng cụ vẽ & Mỹ thuật', desc: 'Màu nước, cọ vẽ, bảng vẽ học sinh', cat: 'stationery' },
                { label: 'Đèn học & Dụng cụ bàn học', desc: 'Đèn LED chống cận, máy tính bỏ túi', cat: 'stationery' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCatalogFilter(item.cat as 'stationery' | 'books');
                    const target = document.getElementById('waterfall-feed');
                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full text-left p-2.5 rounded-2xl hover:bg-white border border-transparent hover:border-black/10 transition-all group flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-[#141414] group-hover:text-[#1F3FB0] transition-colors">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-[#6D6A63] line-clamp-1">
                      {item.desc}
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-black/25 group-hover:text-[#1F3FB0] group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>

            {/* Quick Promo Tag */}
            <div className="mt-3 p-3 rounded-2xl bg-[#E5E2DC] border border-black/10 flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-[#2E6F40] shrink-0" />
              <div className="text-[11px] leading-tight">
                <span className="font-bold text-[#141414] block">Freeship Extra 0Đ</span>
                <span className="text-[#6D6A63]">Cho mọi đơn sách & văn phòng phẩm</span>
              </div>
            </div>
          </div>

          {/* CỘT 2: HERO CAROUSEL BANNER & FLASH SALE (Giữa: 6/12 ~ 50%) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Top Carousel Banner (KhoaVerse Archival Meadow Aesthetic) */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#D9E3D8] via-[#E6EDE4] to-[#F4F2ED] border border-black/10 p-6 sm:p-8 shadow-sm flex flex-col justify-between min-h-[220px]">
              <div className="relative z-10 max-w-md space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 text-[#1F3FB0] shadow-xs border border-black/10">
                  <Sparkles className="w-3.5 h-3.5 text-[#1F3FB0]" /> KHÔNG GIAN TRI THỨC NET108KHAI
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#141414] leading-tight">
                  Sắm đồ học tập chất lượng.<br />
                  <span className="italic font-normal text-[#1F3FB0]">Đọc thử sách online 3D miễn phí!</span>
                </h2>
                <p className="text-xs text-[#6D6A63] max-w-sm">
                  Ưu đãi tới 35% bộ bút pastel, sổ tay bìa cứng và tuyển tập trọn bộ tác phẩm của Nguyễn Nhật Ánh.
                </p>
              </div>

              <div className="relative z-10 pt-4 flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => {
                    setCatalogFilter('flash');
                    const target = document.getElementById('waterfall-feed');
                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-xl bg-[#1F3FB0] hover:bg-[#18328C] text-white font-bold text-xs shadow-md shadow-[#1F3FB0]/20 transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" /> Săn Deal Ngay
                </button>
                <button
                  onClick={() => navigateTo('/read')}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#EDEBE6] text-[#141414] border border-black/15 font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#1F3FB0]" /> Vào Kệ Sách 3D
                </button>
              </div>

              {/* Decorative floating book illustration */}
              <div className="absolute right-6 bottom-4 select-none pointer-events-none opacity-20">
                <BookOpen className="w-24 h-24 text-[#141414]" />
              </div>
            </div>

            {/* Bottom: FLASH SALE / GIỜ VÀNG GIÁ SỐC (Taobao Flash Sale with KhoaVerse Styling) */}
            <div className="bg-[#F4F2ED] rounded-3xl p-4 sm:p-5 border border-black/10 shadow-[0_10px_30px_-5px_rgba(20,20,20,0.04)]">
              {/* Flash Sale Header with Live Countdown */}
              <div className="flex items-center justify-between pb-3 border-b border-black/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#1F3FB0] text-white flex items-center justify-center font-black shadow-xs">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <span className="font-serif font-bold text-sm text-[#141414] tracking-tight">
                    GIỜ VÀNG GIÁ SỐC
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white text-[#1F3FB0] border border-[#1F3FB0]/30">
                    Flash Sale
                  </span>
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center gap-1 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5 text-[#1F3FB0]" />
                  <span className="text-[#6D6A63] font-normal">Kết thúc sau:</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-[#141414] text-white font-mono text-xs">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[#6D6A63]">:</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-[#141414] text-white font-mono text-xs">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[#6D6A63]">:</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-[#1F3FB0] text-white font-mono text-xs">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Flash Sale Product Row */}
              <div className="grid grid-cols-3 gap-3 pt-3">
                {flashSaleProducts.map((p) => {
                  const minP = Math.min(...p.variants.map((v) => v.priceVnd));
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      className="cursor-pointer group flex flex-col justify-between p-2 rounded-2xl bg-white hover:bg-white border border-black/10 hover:border-[#1F3FB0]/50 transition-all shadow-xs"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-[#E8E6E1] mb-2">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-[#B08840] text-white text-[9px] font-black">
                          -30%
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-[#141414] line-clamp-1 group-hover:text-[#1F3FB0]">
                          {p.name}
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-[10px] font-bold text-[#1F3FB0]">₫</span>
                          <span className="text-xs font-black text-[#141414] font-serif">
                            {minP.toLocaleString()}
                          </span>
                        </div>
                        {/* Progress Bar (Đã bán X%) */}
                        <div className="w-full bg-[#E5E2DC] rounded-full h-1.5 overflow-hidden">
                          <div className="bg-[#1F3FB0] h-full w-[78%]" />
                        </div>
                        <div className="text-[9px] text-[#6D6A63] text-right">Đã bán 78%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CỘT 3: USER DASHBOARD & GAMIFICATION HUB (Phải: 3/12 ~ 25%) */}
          <div className="lg:col-span-3 bg-[#F4F2ED] rounded-3xl p-5 border border-black/10 shadow-[0_10px_30px_-5px_rgba(20,20,20,0.04)] flex flex-col justify-between gap-4">
            {/* User Profile Summary */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-white border-2 border-black/10 p-1 shadow-sm flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#E5E2DC] flex items-center justify-center">
                  <User className="w-7 h-7 text-[#141414]" />
                </div>
              </div>
              <div>
                <div className="font-serif font-bold text-base text-[#141414] flex items-center justify-center gap-1">
                  Độc Giả Net108Khai
                </div>
                <div className="text-[10px] text-[#1F3FB0] font-bold bg-white px-2 py-0.5 rounded-full inline-block mt-1 border border-[#1F3FB0]/25">
                  Hội Viên Thân Thiết
                </div>
              </div>
            </div>

            {/* Micro Wallet & Vouchers (Taobao Asset Dashboard) */}
            <div className="grid grid-cols-3 gap-1.5 p-2 rounded-2xl bg-white border border-black/10 text-center text-xs">
              <div className="p-1">
                <div className="font-black text-[#1F3FB0] text-sm">3</div>
                <div className="text-[10px] text-[#6D6A63]">Voucher</div>
              </div>
              <div className="p-1 border-x border-black/10">
                <div className="font-black text-[#B08840] text-sm">{coins}</div>
                <div className="text-[10px] text-[#6D6A63]">Xu tích lũy</div>
              </div>
              <div className="p-1">
                <div className="font-black text-[#141414] text-sm">{orders.length}</div>
                <div className="text-[10px] text-[#6D6A63]">Đơn hàng</div>
              </div>
            </div>

            {/* Gamification: Daily Check-in Button */}
            <button
              onClick={() => {
                if (!hasCheckedIn) {
                  setCoins((c) => c + 50);
                  setHasCheckedIn(true);
                }
              }}
              disabled={hasCheckedIn}
              className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                hasCheckedIn
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 cursor-default'
                  : 'bg-[#141414] hover:bg-[#1F3FB0] text-white active:scale-95'
              }`}
            >
              {hasCheckedIn ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" /> Đã nhận 50 xu hôm nay!
                </>
              ) : (
                <>
                  <Gift className="w-3.5 h-3.5" /> Điểm danh nhận 50 xu!
                </>
              )}
            </button>

            {/* Quick Navigation Gateways */}
            <div className="space-y-2 pt-2 border-t border-black/10">
              <button
                onClick={() => navigateTo('/read')}
                className="w-full p-2.5 rounded-2xl bg-white hover:bg-[#EDEBE6] border border-black/10 text-left flex items-center justify-between text-xs font-bold text-[#1F3FB0] transition-all group"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#1F3FB0]" />
                  <span>Kệ Sách 3D KhoaVerse</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#1F3FB0] group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => setActiveTab('assistant')}
                className="w-full p-2.5 rounded-2xl bg-white hover:bg-[#EDEBE6] border border-black/10 text-left flex items-center justify-between text-xs font-bold text-[#141414] transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#B08840]" />
                  <span>Trợ Lý Mua Sắm AI</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#6D6A63] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SUB-SERVICES / QUICK CHANNELS ICONS (Taobao Channel Matrix with KhoaVerse Accents) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-5 w-full">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { icon: <Zap className="w-5 h-5 text-[#1F3FB0]" />, title: 'Siêu Sale', filter: 'flash' },
            { icon: <BookOpen className="w-5 h-5 text-[#1F3FB0]" />, title: 'Đọc Sách 3D', action: () => navigateTo('/read') },
            { icon: <Truck className="w-5 h-5 text-[#2E6F40]" />, title: 'Freeship Extra', filter: 'all' },
            { icon: <Flame className="w-5 h-5 text-[#B08840]" />, title: 'Bán Chạy Nhất', filter: 'bestseller' },
            { icon: <Palette className="w-5 h-5 text-[#141414]" />, title: 'Văn Phòng Phẩm', filter: 'stationery' },
            { icon: <Sparkles className="w-5 h-5 text-[#1F3FB0]" />, title: 'Trợ Lý AI', action: () => setActiveTab('assistant') },
          ].map((ch, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (ch.action) ch.action();
                else if (ch.filter) setCatalogFilter(ch.filter as any);
              }}
              className="p-3 rounded-2xl bg-[#F4F2ED] border border-black/10 hover:border-[#1F3FB0]/40 hover:bg-white flex flex-col items-center justify-center gap-1.5 transition-transform hover:-translate-y-1 active:scale-95 shadow-xs"
            >
              <div className="w-9 h-9 rounded-xl bg-white border border-black/5 flex items-center justify-center shadow-xs">
                {ch.icon}
              </div>
              <span className="text-[11px] font-bold text-[#141414]">{ch.title}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 5. WATERFALL FEED — "GỢI Ý CHO BẠN" (Taobao Recommendation Feed with KhoaVerse Style) */}
      <main id="waterfall-feed" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* TAB 1: CATALOG / WATERFALL FEED */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            {/* Feed Header with Recommendation Segmented Tabs */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-black/10 pb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#1F3FB0] fill-current" />
                <h3 className="font-serif text-lg font-bold text-[#141414] tracking-tight">
                  CÓ THỂ BẠN THÍCH <span className="font-sans text-xs font-normal text-[#6D6A63]">(Gợi ý cho bạn)</span>
                </h3>
              </div>

              {/* Feed Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-[#E5E2DC] rounded-2xl border border-black/10 shadow-xs overflow-x-auto w-full sm:w-auto">
                {[
                  { id: 'all', label: 'Tất cả sản phẩm' },
                  { id: 'stationery', label: 'Đồ dùng học tập' },
                  { id: 'books', label: 'Sách & Truyện' },
                  { id: 'flash', label: 'Flash Sale' },
                  { id: 'bestseller', label: 'Bán chạy nhất' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setCatalogFilter(t.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      catalogFilter === t.id
                        ? 'bg-[#1F3FB0] text-white shadow-xs'
                        : 'text-[#6D6A63] hover:text-[#141414]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Grid (Taobao 4 Columns Layout) */}
            {isLoadingProducts ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
                {[...Array(8)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : productError ? (
              <ErrorState title="Lỗi tải sản phẩm" message={productError} onRetry={() => fetchProducts(searchQuery)} />
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                title="Không tìm thấy sản phẩm phù hợp"
                description="Hãy thử tìm bằng từ khóa khác hoặc chuyển danh mục bạn nhé!"
                actionText="Xem tất cả sản phẩm"
                onAction={() => {
                  setSearchQuery('');
                  setCatalogFilter('all');
                }}
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={(p) => {
                      if (p.runwayLookIndex !== undefined) {
                        setActiveRunwayLook(p.runwayLookIndex);
                      } else {
                        setSelectedProduct(p);
                      }
                    }}
                    onReadSample={(slug) => navigateTo(`/read/${slug}`)}
                    onOpenRunway={(p) => setActiveRunwayLook(p.runwayLookIndex ?? 0)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AI ASSISTANT VIEW */}
        {activeTab === 'assistant' && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-1">
              <h2 className="font-serif text-2xl font-bold text-[#141414] tracking-tight flex items-center justify-center gap-2">
                Trợ Lý Mua Sắm AI <Sparkles className="w-5 h-5 text-[#1F3FB0]" />
              </h2>
              <p className="text-sm text-[#6D6A63]">
                Gợi ý văn phòng phẩm, chọn sách học sinh theo lứa tuổi và giải đáp thắc mắc tức thì.
              </p>
            </div>
            <AssistantChat onSelectProduct={(p) => setSelectedProduct(p)} />
          </div>
        )}

        {/* TAB 3: ORDER HISTORY VIEW */}
        {activeTab === 'orders' && (
          <OrderHistoryView
            orders={orders}
            onRefresh={() => {}}
            onExplore={() => {
              setActiveTab('catalog');
              navigateTo('/');
            }}
          />
        )}
      </main>

      {/* 6. FLOATING STICKY ACTION BAR (Thanh công cụ nổi bên phải màn hình kiểu Taobao) */}
      <aside className="fixed right-3 bottom-6 z-30 flex flex-col gap-2 select-none" aria-label="Công cụ nhanh">
        {/* AI Chat Bubble */}
        <button
          onClick={() => setActiveTab('assistant')}
          className="w-11 h-11 rounded-2xl bg-[#1F3FB0] text-white flex items-center justify-center shadow-lg shadow-[#1F3FB0]/20 hover:scale-110 active:scale-95 transition-all"
          title="Trò chuyện cùng Trợ lý AI"
          aria-label="Trợ lý AI"
        >
          <Sparkles className="w-5 h-5" />
        </button>

        {/* Floating Cart */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative w-11 h-11 rounded-2xl bg-white text-[#141414] border border-black/15 flex items-center justify-center shadow-lg shadow-black/5 hover:border-[#1F3FB0] hover:text-[#1F3FB0] hover:scale-110 active:scale-95 transition-all"
          title="Xem giỏ hàng"
          aria-label="Giỏ hàng"
        >
          <ShoppingBag className="w-5 h-5" />
          {totalCartItems > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[#1F3FB0] text-white font-bold text-[10px] flex items-center justify-center">
              {totalCartItems}
            </span>
          )}
        </button>

        {/* 3D KhoaVerse Book Shelf Gateway */}
        <button
          onClick={() => navigateTo('/read')}
          className="w-11 h-11 rounded-2xl bg-[#141414] text-white flex items-center justify-center shadow-lg shadow-black/10 hover:bg-[#1F3FB0] hover:scale-110 active:scale-95 transition-all"
          title="Không gian đọc sách 3D KhoaVerse"
          aria-label="Đọc sách 3D"
        >
          <BookOpen className="w-5 h-5" />
        </button>

        {/* Scroll To Top */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-11 h-11 rounded-2xl bg-white text-[#6D6A63] border border-black/15 flex items-center justify-center shadow-md hover:text-[#141414] hover:scale-110 active:scale-95 transition-all"
          title="Lên đầu trang"
          aria-label="Lên đầu trang"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </aside>

      {/* 7. MODAL TÌM KIẾM BẰNG HÌNH ẢNH (Snap-to-Search / 拍立淘 Modal) */}
      {isImageSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-[#F4F2ED] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-black/10 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white text-[#1F3FB0] flex items-center justify-center border border-black/10">
                  <Camera className="w-4 h-4" />
                </div>
                <h4 className="font-serif font-bold text-base text-[#141414]">Tìm kiếm bằng hình ảnh</h4>
              </div>
              <button
                onClick={() => setIsImageSearchOpen(false)}
                className="w-7 h-7 rounded-full bg-white hover:bg-zinc-200 flex items-center justify-center text-[#6D6A63] text-xs border border-black/10"
              >
                ✕
              </button>
            </div>

            <div className="border-2 border-dashed border-black/20 rounded-2xl p-8 text-center space-y-2 bg-white hover:border-[#1F3FB0] transition-colors cursor-pointer">
              <Camera className="w-10 h-10 text-[#1F3FB0] mx-auto" />
              <div className="font-bold text-sm text-[#141414]">Tải ảnh hoặc dán ảnh vào đây</div>
              <p className="text-xs text-[#6D6A63]">
                AI sẽ nhận diện và tìm các loại bút, sách hoặc balo tương tự trong chớp mắt!
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsImageSearchOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#6D6A63] bg-white border border-black/10 hover:bg-zinc-100"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setSearchQuery('pastel');
                  setIsImageSearchOpen(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#1F3FB0] hover:bg-[#18328C] shadow-md shadow-[#1F3FB0]/20"
              >
                Thử ảnh mẫu (Bút Pastel)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. FOOTER (KhoaVerse Harmonized E-Commerce Style) */}
      <footer className="border-t border-black/10 bg-[#E5E2DC] py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6D6A63] font-medium">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-[#141414]">Net108Khai Mall</span>
            <span>•</span>
            <span>Mô hình Taobao E-Commerce cho Văn phòng phẩm & Sách</span>
          </div>
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-[#1F3FB0]" />
            <span>Cam kết chính hãng · Đọc thử sách 3D trực tuyến</span>
          </div>
        </div>
      </footer>

      {/* 9. GLOBAL MODALS & DRAWERS */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onReadSample={(slug) => navigateTo(`/read/${slug}`)}
        onOpenRunway={(look) => setActiveRunwayLook(look ?? 0)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        lines={cartLines}
        totalVnd={totalCartVnd}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        lines={cartLines}
        totalVnd={totalCartVnd}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* 10. BỘ CHỌN MẪU MÃ & THỬ ĐỒ 3D RUNWAY (MODAL DIALOG TINH GỌN, TỐI GIẢN) */}
      {activeRunwayLook !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 md:p-6 animate-fade-in"
          onClick={() => setActiveRunwayLook(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Bộ chọn mẫu mã và thử đồ 3D"
        >
          <div
            className="relative w-full h-full sm:h-[90vh] max-w-6xl bg-white sm:rounded-3xl shadow-2xl overflow-hidden border border-black/10 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Quick Close Floating Button */}
            <button
              type="button"
              onClick={() => setActiveRunwayLook(null)}
              className="absolute top-2.5 right-3 z-50 w-8 h-8 rounded-full bg-zinc-900/80 hover:bg-black text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
              aria-label="Đóng bộ chọn mẫu mã"
              title="Đóng (Esc)"
            >
              <span className="text-sm font-bold leading-none">✕</span>
            </button>

            <iframe
              src={`/maison-vell/index.html?look=${activeRunwayLook}`}
              className="w-full h-full border-0 block flex-1"
              title="Bộ Chọn Mẫu Mã 3D Runway"
            />
          </div>
        </div>
      )}
    </div>
  );
};
