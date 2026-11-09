import React, { useState, useEffect } from 'react';
import { Product, Variant, CartLine, Order } from './types';
import { api } from './api';
import { ProductCard } from './components/catalog/ProductCard';
import { ProductDetailModal } from './components/catalog/ProductDetailModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { OrderHistoryView } from './components/orders/OrderHistoryView';
import { AssistantChat } from './components/assistant/AssistantChat';
import { Button } from './components/common/Button';
import { ProductCardSkeleton, ErrorState, EmptyState } from './components/common/FeedbackStates';
import { ShoppingBag, Search, Sparkles, Package, ShieldCheck, HeartHandshake } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'catalog' | 'assistant' | 'orders'>('catalog');

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  // Cart state
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);

  // Fetch products
  const fetchProducts = async (q = '') => {
    setIsLoadingProducts(true);
    setProductError(null);
    try {
      const res = await api.getProducts(q);
      setProducts(res.items);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải danh sách sản phẩm.';
      setProductError(msg);
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
    setCartLines([]); // clear cart
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 font-sans selection:bg-emerald-100">
      {/* 1. Header (Sticky & Glassmorphism Blur) */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('catalog')}
              className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-lg p-1"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                N
              </div>
              <span className="font-extrabold text-lg text-zinc-900 tracking-tight">
                Net108Khai <span className="text-emerald-600 text-xs font-semibold uppercase px-1.5 py-0.5 bg-emerald-50 rounded border border-emerald-200">Commerce</span>
              </span>
            </button>

            {/* Navigation Tabs (Desktop) */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Điều hướng chính">
              <button
                onClick={() => setActiveTab('catalog')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors min-h-[44px] flex items-center ${
                  activeTab === 'catalog' ? 'bg-zinc-100 text-emerald-800' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Sản phẩm
              </button>
              <button
                onClick={() => setActiveTab('assistant')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors min-h-[44px] flex items-center gap-1.5 ${
                  activeTab === 'assistant' ? 'bg-emerald-50 text-emerald-800' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-600" /> Trợ lý AI
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors min-h-[44px] flex items-center gap-1.5 ${
                  activeTab === 'orders' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Package className="w-4 h-4" /> Đơn hàng
              </button>
            </nav>
          </div>

          {/* Right Header Controls (Cart Button) */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCartOpen(true)}
              className="relative"
              aria-label={`Giỏ hàng có ${totalCartItems} sản phẩm`}
            >
              <ShoppingBag className="w-4 h-4 mr-1 text-zinc-700" />
              <span className="hidden sm:inline">Giỏ hàng</span>
              {totalCartItems > 0 && (
                <span className="ml-1.5 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-xs">
                  {totalCartItems}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex border-t border-zinc-100 px-4 py-1.5 justify-around bg-white">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`text-xs font-semibold py-2 px-3 rounded-lg flex items-center gap-1 ${
              activeTab === 'catalog' ? 'text-emerald-700 bg-emerald-50' : 'text-zinc-600'
            }`}
          >
            Sản phẩm
          </button>
          <button
            onClick={() => setActiveTab('assistant')}
            className={`text-xs font-semibold py-2 px-3 rounded-lg flex items-center gap-1 ${
              activeTab === 'assistant' ? 'text-emerald-700 bg-emerald-50' : 'text-zinc-600'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Trợ lý AI
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`text-xs font-semibold py-2 px-3 rounded-lg flex items-center gap-1 ${
              activeTab === 'orders' ? 'text-zinc-900 bg-zinc-100' : 'text-zinc-600'
            }`}
          >
            <Package className="w-3.5 h-3.5" /> Đơn hàng
          </button>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: CATALOG VIEW */}
        {activeTab === 'catalog' && (
          <div className="space-y-8">
            {/* Taste-skill Hero Section: One section per screen cadence */}
            <section
              data-enter
              className="relative rounded-3xl bg-gradient-to-b from-emerald-900 to-zinc-900 text-white p-8 md:p-14 overflow-hidden shadow-elevation"
            >
              <div className="max-w-2xl space-y-4 relative z-10">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5" /> Trải Nghiệm Mua Sắm Chuẩn Xác
                </span>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  Chất lượng thật.<br />Giá trị minh bạch.
                </h1>
                <p className="text-sm sm:text-base text-zinc-300 max-w-lg leading-relaxed">
                  Toàn bộ sản phẩm được kiểm định nguồn gốc, hiển thị tồn kho và đơn giá VNĐ chuẩn thời gian thực.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setActiveTab('assistant')}
                    icon={<Sparkles className="w-5 h-5" />}
                  >
                    Hỏi Trợ Lý AI Ngay
                  </Button>
                </div>
              </div>

              {/* Decorative Subtle Grid Background */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                  backgroundSize: '24px 24px',
                }}
              />
            </section>

            {/* Catalog Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm (áo thun, balo, tai nghe...)"
                  className="w-full bg-white border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-sm"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Hiển thị tồn kho tức thì</span>
              </div>
            </div>

            {/* Product Grid / State Machine */}
            {isLoadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : productError ? (
              <ErrorState message={productError} onRetry={() => fetchProducts(searchQuery)} />
            ) : products.length === 0 ? (
              <EmptyState
                title="Không tìm thấy sản phẩm"
                description={`Không có kết quả nào phù hợp với từ khóa "${searchQuery}". Bạn hãy thử tìm kiếm từ khóa khác.`}
                actionText="Xóa bộ lọc tìm kiếm"
                onAction={() => setSearchQuery('')}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={(p) => setSelectedProduct(p)}
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
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Trò Chuyện Cùng AI</h2>
              <p className="text-sm text-zinc-500">
                Trợ lý AI giúp bạn so sánh đặc tính, kiểm tra kho và tìm sản phẩm với giá tốt nhất.
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
            onExplore={() => setActiveTab('catalog')}
          />
        )}
      </main>

      {/* 3. Footer (Taste-skill compliant) */}
      <footer className="border-t border-zinc-200 bg-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-800">Net108Khai AI Native Commerce</span>
            <span>•</span>
            <span>Hệ thống bán hàng tiêu chuẩn</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
            <span>Thiết kế theo triết lý Impeccable & Taste-Skill</span>
          </div>
        </div>
      </footer>

      {/* 4. Global Modals & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
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
    </div>
  );
};
