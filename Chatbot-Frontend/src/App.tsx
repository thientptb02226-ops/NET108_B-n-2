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
import { motion } from 'motion/react';
import { CountingNumber } from '@animate-ui/react/primitives/texts/counting-number';
import { Shine } from '@animate-ui/react/primitives/effects/shine';

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

  // Runway 3D Lookbook state (supports query param ?look=0..5 or ?runway=0..5)
  const [activeRunwayLook, setActiveRunwayLook] = useState<number | null>(() => {
    try {
      const pms = new URLSearchParams(window.location.search);
      const look = pms.get('look') ?? pms.get('runway');
      if (look !== null) {
        const parsed = parseInt(look, 10);
        return isNaN(parsed) ? 0 : parsed;
      }
    } catch (_) {}
    return null;
  });

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
        const { name, option, size, price, quantity = 1, buyNow } = e.data;
        const numPrice = parseInt(String(price).replace(/[^0-9]/g, ''), 10) || 1000;
        const priceVnd = numPrice * 25400; // ~$1 = 25,400 VND
        const titleSuffix = [option, size ? `Size ${size}` : null].filter(Boolean).join(' • ');
        const fullTitle = titleSuffix ? `${name} (${titleSuffix})` : `Maison Vell — ${name}`;
        const qty = Math.max(1, parseInt(String(quantity), 10) || 1);
        const sku = `MV-${String(name).toUpperCase().replace(/\s+/g, '-')}-${String(option || 'DEFAULT').toUpperCase().replace(/\s+/g, '-')}-${String(size || 'S')}`;

        setCartLines((prev) => {
          const existing = prev.find((l) => l.sku === sku);
          if (existing) {
            return prev.map((l) =>
              l.sku === sku ? { ...l, quantity: l.quantity + qty } : l
            );
          }
          return [
            ...prev,
            {
              variantId: `mv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              sku,
              name: fullTitle,
              priceVnd,
              quantity: qty,
            },
          ];
        });

        if (buyNow) {
          setIsCheckoutOpen(true);
        } else {
          setIsCartOpen(true);
        }
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

  // ROUTE 2: COMMERCE STORE (TAOBAO ARCHITECTURE + SOFT MINT STUDIO PALETTE #F8FAF4)
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF4] text-[#141414] font-sans selection:bg-[#08482D]/20 selection:text-[#08482D] relative overflow-x-hidden w-full max-w-full">
      {/* Paper Grain Texture Overlay */}
      <div className="grain" aria-hidden="true" />

      {/* 1. TOP UTILITY BAR (Soft Mint Harmonized Palette) */}
      <div className="bg-[#EFF3EA] border-b border-black/10 text-[11px] text-[#6D6A63] py-1.5 px-4 sm:px-6 lg:px-8 relative z-10">
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

      {/* 2. MEGA SEARCH BAND */}
      <header className="bg-[#F8FAF4]/95 backdrop-blur-md sticky top-0 z-40 border-b border-black/10 shadow-[0_4px_20px_-8px_rgba(20,20,20,0.06)]">
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
              <div className="w-11 h-11 rounded-2xl bg-[#08482D] text-white flex items-center justify-center font-serif shadow-sm group-hover:bg-[#E84E25] transition-colors">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-[#141414] group-hover:text-[#08482D] transition-colors leading-none flex items-center gap-1.5">
                  Net108Khai
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E5EFE3] text-[#08482D] border border-[#08482D]/20">
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
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsCartOpen(true)}
                className="relative w-10 h-10 rounded-xl bg-white text-[#141414] flex items-center justify-center border border-black/15 shadow-xs"
                aria-label="Giỏ hàng"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-[#1F3FB0] text-white font-bold text-[10px] flex items-center justify-center">
                    {totalCartItems}
                  </span>
                )}
              </motion.button>
            </div>
          </div>

          {/* Central Mega Search Bar (Taobao Style with Snap-to-Search Camera) */}
          <div className="w-full md:max-w-2xl flex flex-col gap-1.5">
            {/* Search Category Tabs with Animate UI Gliding Indicator */}
            <div className="relative flex items-center gap-1 px-1 text-xs font-bold text-[#6D6A63]">
              {[
                { id: 'all', label: 'Tất cả sản phẩm' },
                { id: 'books', label: 'Sách & Truyện' },
                { id: 'stationery', label: 'Văn phòng phẩm' },
              ].map((cat) => {
                const isActive = searchCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSearchCategory(cat.id as any)}
                    className={`relative px-3 py-1 rounded-full transition-colors ${
                      isActive ? 'text-[#08482D]' : 'hover:text-[#141414]'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-search-category-pill"
                        className="absolute inset-0 bg-[#E5EFE3] rounded-full -z-10 border border-[#08482D]/20 shadow-xs"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Big Search Input Box */}
            <div className="relative flex items-center">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm bút pastel, balo chống gù, truyện Nguyễn Nhật Ánh..."
                  className="w-full bg-white border-2 border-black/12 focus:border-[#08482D] focus:bg-white rounded-full pl-5 pr-20 py-2.5 text-sm text-[#141414] focus:outline-none transition-all placeholder-[#6D6A63]/60 shadow-xs"
                />
                {/* Camera Snap-to-Search (拍立淘 Taobao Feature) */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  onClick={() => setIsImageSearchOpen(true)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6D6A63] hover:text-[#08482D] transition-colors p-1"
                  title="Tìm kiếm bằng hình ảnh (Snap to search)"
                >
                  <Camera className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Main Search Button (Exciting Sunset Coral Accent with Animate UI Spring Press) */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 550, damping: 30 }}
                onClick={() => fetchProducts(searchQuery)}
                className="ml-2 px-6 py-2.5 rounded-full bg-[#E84E25] hover:bg-[#D03E17] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#E84E25]/25 transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Tìm kiếm</span>
              </motion.button>
            </div>

            {/* Hot Trend Search Keywords below search bar */}
            <div className="hidden sm:flex items-center gap-2 overflow-x-auto text-[11px] text-[#6D6A63] pt-0.5">
              <span className="text-[#E84E25] font-bold flex items-center gap-0.5 shrink-0">
                <Flame className="w-3 h-3 fill-current" /> Hot:
              </span>
              {hotSearchKeywords.map((kw) => (
                <button
                  key={kw}
                  onClick={() => setSearchQuery(kw)}
                  className="hover:text-[#08482D] hover:underline whitespace-nowrap transition-colors"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Cart Button */}
          <div className="hidden md:flex items-center gap-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              onClick={() => setIsCartOpen(true)}
              className="relative inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-white border border-black/12 text-[#141414] hover:border-[#08482D] hover:text-[#08482D] transition-colors shadow-xs select-none"
              title={`Giỏ hàng (${totalCartItems} món)`}
              aria-label="Giỏ hàng"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E84E25] text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                  {totalCartItems}
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </header>

      {/* 2.5. REEL CAROUSEL HERO SHOWCASE (NẰM DƯỚI MENU HEADER) */}
      <ReelCarouselHero />

      {/* 3. BENTO GRID (Category Nav + Promotion Banner + Profile Hub) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* CỘT 1: MEGA CATEGORY MENU */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-4 border border-black/8 shadow-[0_4px_20px_-4px_rgba(8,72,45,0.06)] flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-black/8">
                <span className="lbl-khoa text-[#08482D] flex items-center gap-1.5 font-bold">
                  <Palette className="w-4 h-4 text-[#08482D]" /> Danh mục ngành hàng
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
                  className="w-full text-left p-2.5 rounded-2xl hover:bg-[#F8FAF4] border border-transparent hover:border-[#08482D]/15 transition-all group flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-[#141414] group-hover:text-[#08482D] transition-colors">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-[#6D6A63] line-clamp-1">
                      {item.desc}
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-black/25 group-hover:text-[#08482D] group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>

            {/* Quick Promo Tag */}
            <div className="mt-3 p-3 rounded-2xl bg-[#F0F5EE] border border-[#08482D]/10 flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-[#08482D] shrink-0" />
              <div className="text-[11px] leading-tight">
                <span className="font-bold text-[#08482D] block">Freeship Extra 0Đ</span>
                <span className="text-[#6D6A63]">Cho mọi đơn sách & văn phòng phẩm</span>
              </div>
            </div>
          </div>

          {/* CỘT 2: HERO CAROUSEL BANNER & FLASH SALE */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Top Carousel Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#E8F2E6] via-[#F3F8F2] to-white border border-[#08482D]/15 p-6 sm:p-8 shadow-sm flex flex-col justify-between min-h-[220px]">
              <div className="relative z-10 max-w-md space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 text-[#08482D] shadow-xs border border-[#08482D]/20">
                  <Sparkles className="w-3.5 h-3.5 text-[#E84E25]" /> KHÔNG GIAN TRI THỨC NET108KHAI
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#141414] leading-tight">
                  Sắm đồ học tập chất lượng.<br />
                  <span className="italic font-normal text-[#E84E25]">Đọc thử sách online 3D miễn phí!</span>
                </h2>
                <p className="text-xs text-[#6D6A63] max-w-sm">
                  Ưu đãi tới 35% bộ bút pastel, sổ tay bìa cứng và tuyển tập trọn bộ tác phẩm của Nguyễn Nhật Ánh.
                </p>
              </div>

              <div className="relative z-10 pt-4 flex flex-wrap items-center gap-2.5">
                <Shine
                  loop
                  loopDelay={2500}
                  duration={1.2}
                  color="rgba(255,255,255,0.4)"
                  className="rounded-xl overflow-hidden inline-block"
                >
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                    onClick={() => {
                      setCatalogFilter('flash');
                      const target = document.getElementById('waterfall-feed');
                      if (target) target.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-4 py-2 rounded-xl bg-[#E84E25] hover:bg-[#D03E17] text-white font-bold text-xs shadow-md shadow-[#E84E25]/25 transition-colors flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" /> Săn Deal Ngay
                  </motion.button>
                </Shine>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                  onClick={() => navigateTo('/read')}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#F0F5EE] text-[#08482D] border border-[#08482D]/20 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#08482D]" /> Vào Kệ Sách 3D
                </motion.button>
              </div>

              {/* Decorative floating book illustration */}
              <div className="absolute right-6 bottom-4 select-none pointer-events-none opacity-20">
                <BookOpen className="w-24 h-24 text-[#08482D]" />
              </div>
            </div>

            {/* Bottom: FLASH SALE */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-black/8 shadow-[0_4px_20px_-4px_rgba(8,72,45,0.06)]">
              {/* Flash Sale Header with Live Countdown */}
              <div className="flex items-center justify-between pb-3 border-b border-black/8">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#E84E25] text-white flex items-center justify-center font-black shadow-xs">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <span className="font-serif font-bold text-sm text-[#141414] tracking-tight">
                    GIỜ VÀNG GIÁ SỐC
                  </span>
                  <Shine
                    loop
                    loopDelay={3000}
                    duration={1}
                    color="rgba(232,78,37,0.3)"
                    className="rounded-full inline-block"
                  >
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#FFF0EB] text-[#E84E25] border border-[#E84E25]/30 block">
                      Flash Sale
                    </span>
                  </Shine>
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center gap-1 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5 text-[#E84E25]" />
                  <span className="text-[#6D6A63] font-normal">Kết thúc sau:</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-[#08482D] text-white font-mono text-xs">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[#6D6A63]">:</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-[#08482D] text-white font-mono text-xs">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[#6D6A63]">:</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-[#E84E25] text-white font-mono text-xs">
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
                      onClick={() => {
                        const lookIdx = p.runwayLookIndex !== undefined
                          ? p.runwayLookIndex
                          : (flashSaleProducts.indexOf(p) % 6);
                        setActiveRunwayLook(lookIdx >= 0 ? lookIdx : 0);
                      }}
                      className="cursor-pointer group flex flex-col justify-between p-2 rounded-2xl bg-white hover:bg-white border border-black/8 hover:border-[#E84E25]/50 transition-all shadow-xs"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F4F7F2] mb-2">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-[#E84E25] text-white text-[9px] font-black">
                          -30%
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-[#141414] line-clamp-1 group-hover:text-[#08482D]">
                          {p.name}
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-[10px] font-bold text-[#E84E25]">₫</span>
                          <span className="text-xs font-black text-[#141414] font-serif">
                            {minP.toLocaleString()}
                          </span>
                        </div>
                        {/* Progress Bar (Đã bán X%) */}
                        <div className="w-full bg-[#EBF2EA] rounded-full h-1.5 overflow-hidden">
                          <div className="bg-[#E84E25] h-full w-[78%]" />
                        </div>
                        <div className="text-[9px] text-[#6D6A63] text-right">Đã bán 78%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CỘT 3: USER DASHBOARD & GAMIFICATION HUB */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-5 border border-black/8 shadow-[0_4px_20px_-4px_rgba(8,72,45,0.06)] flex flex-col justify-between gap-4">
            {/* User Profile Summary */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-white border-2 border-[#08482D]/15 p-1 shadow-sm flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#F0F5EE] flex items-center justify-center">
                  <User className="w-7 h-7 text-[#08482D]" />
                </div>
              </div>
              <div>
                <div className="font-serif font-bold text-base text-[#141414] flex items-center justify-center gap-1">
                  Độc Giả Net108Khai
                </div>
                <div className="text-[10px] text-[#08482D] font-bold bg-[#E5EFE3] px-2 py-0.5 rounded-full inline-block mt-1 border border-[#08482D]/20">
                  Hội Viên Thân Thiết
                </div>
              </div>
            </div>

            {/* Micro Wallet & Vouchers */}
            <div className="grid grid-cols-3 gap-1.5 p-2 rounded-2xl bg-[#F8FAF4] border border-black/8 text-center text-xs">
              <div className="p-1">
                <div className="font-black text-[#08482D] text-sm">
                  <CountingNumber number={3} />
                </div>
                <div className="text-[10px] text-[#6D6A63]">Voucher</div>
              </div>
              <div className="p-1 border-x border-black/8">
                <div className="font-black text-[#E84E25] text-sm">
                  <CountingNumber number={coins} thousandSeparator="." />
                </div>
                <div className="text-[10px] text-[#6D6A63]">Xu tích lũy</div>
              </div>
              <div className="p-1">
                <div className="font-black text-[#141414] text-sm">
                  <CountingNumber number={orders.length} />
                </div>
                <div className="text-[10px] text-[#6D6A63]">Đơn hàng</div>
              </div>
            </div>

            {/* Gamification: Daily Check-in Button */}
            <motion.button
              whileHover={!hasCheckedIn ? { scale: 1.02 } : undefined}
              whileTap={!hasCheckedIn ? { scale: 0.95 } : undefined}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
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
                  : 'bg-[#08482D] hover:bg-[#E84E25] text-white shadow-md shadow-[#08482D]/15'
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
            </motion.button>

            {/* Quick Navigation Gateways */}
            <div className="space-y-2 pt-2 border-t border-black/8">
              <button
                onClick={() => navigateTo('/read')}
                className="w-full p-2.5 rounded-2xl bg-[#F8FAF4] hover:bg-[#F0F5EE] border border-black/8 text-left flex items-center justify-between text-xs font-bold text-[#08482D] transition-all group"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#08482D]" />
                  <span>Kệ Sách 3D KhoaVerse</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#08482D] group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => setActiveTab('assistant')}
                className="w-full p-2.5 rounded-2xl bg-[#F8FAF4] hover:bg-[#F0F5EE] border border-black/8 text-left flex items-center justify-between text-xs font-bold text-[#141414] transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E84E25]" />
                  <span>Trợ Lý Mua Sắm AI</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#6D6A63] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SUB-SERVICES / QUICK CHANNELS ICONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-5 w-full">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { icon: <Zap className="w-5 h-5 text-[#E84E25]" />, title: 'Siêu Sale', filter: 'flash' },
            { icon: <BookOpen className="w-5 h-5 text-[#08482D]" />, title: 'Đọc Sách 3D', action: () => navigateTo('/read') },
            { icon: <Truck className="w-5 h-5 text-[#08482D]" />, title: 'Freeship Extra', filter: 'all' },
            { icon: <Flame className="w-5 h-5 text-[#E84E25]" />, title: 'Bán Chạy Nhất', filter: 'bestseller' },
            { icon: <Palette className="w-5 h-5 text-[#141414]" />, title: 'Văn Phòng Phẩm', filter: 'stationery' },
            { icon: <Sparkles className="w-5 h-5 text-[#E84E25]" />, title: 'Trợ Lý AI', action: () => setActiveTab('assistant') },
          ].map((ch, idx) => (
            <motion.button
              key={idx}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              onClick={() => {
                if (ch.action) ch.action();
                else if (ch.filter) setCatalogFilter(ch.filter as any);
              }}
              className="p-3 rounded-2xl bg-white border border-black/8 hover:border-[#08482D]/40 hover:shadow-md flex flex-col items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F8FAF4] border border-black/5 flex items-center justify-center shadow-xs">
                {ch.icon}
              </div>
              <span className="text-[11px] font-bold text-[#141414]">{ch.title}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* 5. WATERFALL FEED — "GỢI Ý CHO BẠN" */}
      <main id="waterfall-feed" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* TAB 1: CATALOG / WATERFALL FEED */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            {/* Feed Header with Recommendation Segmented Tabs */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-black/8 pb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#E84E25] fill-current" />
                <h3 className="font-serif text-lg font-bold text-[#141414] tracking-tight">
                  CÓ THỂ BẠN THÍCH <span className="font-sans text-xs font-normal text-[#6D6A63]">(Gợi ý cho bạn)</span>
                </h3>
              </div>

              {/* Feed Filter Tabs with Animate UI Gliding Highlight */}
              <div className="relative flex items-center gap-1 p-1 bg-white rounded-2xl border border-black/8 shadow-xs overflow-x-auto w-full sm:w-auto">
                {[
                  { id: 'all', label: 'Tất cả sản phẩm' },
                  { id: 'stationery', label: 'Đồ dùng học tập' },
                  { id: 'books', label: 'Sách & Truyện' },
                  { id: 'flash', label: 'Flash Sale' },
                  { id: 'bestseller', label: 'Bán chạy nhất' },
                ].map((t) => {
                  const isActive = catalogFilter === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setCatalogFilter(t.id as any)}
                      className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                        isActive ? 'text-white' : 'text-[#6D6A63] hover:text-[#08482D]'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-feed-filter-pill"
                          className="absolute inset-0 bg-[#08482D] rounded-xl -z-10 shadow-xs"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                      <span>{t.label}</span>
                    </button>
                  );
                })}
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
                      const lookIdx = p.runwayLookIndex !== undefined
                        ? p.runwayLookIndex
                        : (filteredProducts.indexOf(p) % 6);
                      setActiveRunwayLook(lookIdx >= 0 ? lookIdx : 0);
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

      {/* 6. FLOATING STICKY ACTION BAR */}
      <aside className="fixed right-3 bottom-6 z-30 flex flex-col gap-2 select-none" aria-label="Công cụ nhanh">
        {/* AI Chat Bubble (Botanical Green + Glow) */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          onClick={() => setActiveTab('assistant')}
          className="w-11 h-11 rounded-2xl bg-[#08482D] text-white flex items-center justify-center shadow-lg shadow-[#08482D]/25 hover:bg-[#E84E25] transition-colors"
          title="Trò chuyện cùng Trợ lý AI"
          aria-label="Trợ lý AI"
        >
          <Sparkles className="w-5 h-5" />
        </motion.button>

        {/* Floating Cart */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          onClick={() => setIsCartOpen(true)}
          className="relative w-11 h-11 rounded-2xl bg-white text-[#141414] border border-black/12 flex items-center justify-center shadow-lg shadow-black/5 hover:border-[#08482D] hover:text-[#08482D] transition-colors"
          title={`Xem giỏ hàng (${totalCartItems} món)`}
          aria-label="Giỏ hàng"
        >
          <ShoppingBag className="w-5 h-5" />
          {totalCartItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E84E25] text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
              {totalCartItems}
            </span>
          )}
        </motion.button>

        {/* 3D KhoaVerse Book Shelf Gateway */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          onClick={() => navigateTo('/read')}
          className="w-11 h-11 rounded-2xl bg-[#141414] text-white flex items-center justify-center shadow-lg shadow-black/10 hover:bg-[#08482D] transition-colors"
          title="Không gian đọc sách 3D KhoaVerse"
          aria-label="Đọc sách 3D"
        >
          <BookOpen className="w-5 h-5" />
        </motion.button>

        {/* Scroll To Top */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-11 h-11 rounded-2xl bg-white text-[#6D6A63] border border-black/15 flex items-center justify-center shadow-md hover:text-[#141414] transition-colors"
          title="Lên đầu trang"
          aria-label="Lên đầu trang"
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>
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

      {/* 8. FOOTER (Soft Mint Harmonized E-Commerce Style) */}
      <footer className="border-t border-black/10 bg-[#EFF3EA] py-10 mt-auto">
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
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-zinc-800 hover:text-black flex items-center justify-center transition-all shadow-xl active:scale-95 border border-black/15 cursor-pointer"
              aria-label="Đóng (Esc)"
              title="Đóng bộ chọn (Esc)"
            >
              <span className="text-lg font-bold leading-none">✕</span>
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
