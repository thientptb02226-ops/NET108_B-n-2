import React, { useState } from 'react';
import { Product, Variant } from '../../types';
import { formatVnd } from '../../api';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Check, ShoppingBag, Plus, Minus, BookOpen } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (variant: Variant, quantity: number) => void;
  onReadSample?: (slug: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onReadSample,
}) => {
  if (!product) return null;

  const [selectedVariant, setSelectedVariant] = useState<Variant>(
    product.variants[0] || { id: '', sku: '', name: '', priceVnd: 0, stock: 0 }
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    if (selectedVariant.stock <= 0) return;
    onAddToCart(selectedVariant, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 800);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết sản phẩm" maxWidth="max-w-xl">
      <div className="space-y-6">
        {/* Top Product Summary */}
        <div className="flex gap-4">
          <div className="w-28 h-28 rounded-2xl bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className="space-y-1">
            <h4 className="font-serif text-xl font-bold text-[#141414] leading-snug">{product.name}</h4>
            <p className="text-xs text-[#6D6A63] line-clamp-2">{product.description}</p>
            <div className="pt-1 flex items-center gap-2">
              <span className="font-serif text-2xl font-bold text-[#141414]">
                {formatVnd(selectedVariant.priceVnd)}
              </span>
              <Badge variant={selectedVariant.stock > 0 ? 'success' : 'danger'} size="sm">
                {selectedVariant.stock > 0 ? `Còn ${selectedVariant.stock} sản phẩm` : 'Hết hàng'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Variant Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-700 tracking-wide uppercase">
            Phiên bản / Phân loại
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {product.variants.map((v) => {
              const isSelected = selectedVariant.id === v.id;
              const isOut = v.stock <= 0;
              return (
                <button
                  key={v.id}
                  disabled={isOut}
                  onClick={() => {
                    setSelectedVariant(v);
                    setQuantity(1);
                  }}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all min-h-[44px] ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  } ${isOut ? 'opacity-40 cursor-not-allowed bg-zinc-50' : 'cursor-pointer'}`}
                >
                  <div>
                    <div className="text-sm font-semibold text-zinc-900">{v.name}</div>
                    <div className="text-xs text-zinc-500">{formatVnd(v.priceVnd)}</div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-semibold text-zinc-700">Số lượng mua</span>
          <div className="flex items-center gap-2 border border-zinc-200 rounded-xl p-1 bg-zinc-50">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1 || selectedVariant.stock <= 0}
              className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 transition-colors shadow-sm"
              aria-label="Giảm số lượng"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-bold text-zinc-900 text-sm">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(selectedVariant.stock, q + 1))}
              disabled={quantity >= selectedVariant.stock || selectedVariant.stock <= 0}
              className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 transition-colors shadow-sm"
              aria-label="Tăng số lượng"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sample Read Banner if available */}
        {product.sampleReadSlug && onReadSample && (
          <div className="p-3.5 bg-[#1F3FB0]/5 border border-[#1F3FB0]/25 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-[#1F3FB0] shrink-0" />
              <div>
                <div className="lbl-khoa text-[#1F3FB0]">Bản đọc thử trực tuyến</div>
                <div className="text-xs text-[#6D6A63]">Khám phá mục lục và đọc trước trích đoạn miễn phí</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onReadSample(product.sampleReadSlug!);
              }}
              className="lbl-khoa h-8 px-3 rounded-lg border border-[#1F3FB0] text-[#1F3FB0] hover:bg-[#1F3FB0] hover:text-white transition-all shrink-0 bg-white shadow-xs"
            >
              Đọc thử ngay
            </button>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t border-zinc-100 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Đóng
          </Button>
          <Button
            variant="primary"
            disabled={selectedVariant.stock <= 0 || isAdded}
            onClick={handleAddToCart}
            className="flex-1"
            icon={isAdded ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          >
            {isAdded ? 'Đã thêm thành công!' : 'Thêm vào giỏ hàng'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
