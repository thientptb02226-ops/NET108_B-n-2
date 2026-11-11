import React from 'react';
import { Product } from '../../types';
import { formatVnd } from '../../api';
import { ShoppingBag, Star, BookOpen, Flame } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onReadSample?: (slug: string) => void;
  onOpenRunway?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, onReadSample, onOpenRunway }) => {
  const minPrice = Math.min(...product.variants.map((v) => v.priceVnd));
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const isOutOfStock = totalStock === 0;

  // Calculate discount percentage if original price exists
  const discountPercent = product.originalPriceVnd
    ? Math.round(((product.originalPriceVnd - minPrice) / product.originalPriceVnd) * 100)
    : null;

  return (
    <article
      onClick={() => onSelect(product)}
      className="bg-white rounded-2xl border border-black/8 shadow-[0_4px_16px_-4px_rgba(8,72,45,0.06)] hover:-translate-y-1 hover:border-[#08482D]/40 hover:shadow-[0_16px_36px_-6px_rgba(8,72,45,0.14)] transition-all duration-300 overflow-hidden flex flex-col h-full group select-none relative cursor-pointer"
      aria-labelledby={`product-title-${product.id}`}
    >
      {/* 1. Square Image Container */}
      <div className="relative aspect-square bg-[#F4F7F2] overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#6D6A63] bg-[#F4F7F2]">
            <ShoppingBag className="w-12 h-12 stroke-1" />
          </div>
        )}

        {/* Top-Left Ribbon Tags */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-20">
          {product.tags && product.tags.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-tight bg-[#08482D] text-white shadow-xs">
              <Flame className="w-2.5 h-2.5 fill-current text-[#E84E25]" />
              {product.tags[0]}
            </span>
          )}
          {product.sampleReadSlug && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-tight bg-white text-[#08482D] border border-[#08482D]/20 shadow-xs">
              <BookOpen className="w-2.5 h-2.5 text-[#08482D]" />
              Đọc thử 3D
            </span>
          )}
        </div>

        {/* Top-Right Discount Badge */}
        {discountPercent && discountPercent > 0 && (
          <div className="absolute top-2.5 right-2.5 z-20">
            <span className="px-2.5 py-0.5 rounded-full bg-[#E84E25] text-white text-[11px] font-black shadow-xs">
              -{discountPercent}%
            </span>
          </div>
        )}
      </div>

      {/* 2. Product Information */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 bg-white">
        {/* Title */}
        <h4
          id={`product-title-${product.id}`}
          className="text-xs sm:text-sm font-semibold text-[#141414] group-hover:text-[#08482D] transition-colors line-clamp-2 mb-1.5 leading-snug"
        >
          {product.name}
        </h4>

        {/* Social Proof (Ratings & Sales Count) */}
        <div className="flex items-center gap-2 text-[11px] text-[#6D6A63] mb-2.5 font-medium">
          <span className="flex items-center gap-0.5 text-[#D97706] font-bold">
            <Star className="w-3 h-3 fill-current text-[#F59E0B]" />
            {product.rating || 4.9}
          </span>
          <span>•</span>
          <span>Đã bán {(product.salesCount || 1000).toLocaleString()}+</span>
        </div>

        {/* Price & Action Row */}
        <div className="mt-auto pt-2.5 border-t border-black/8 flex items-center justify-between gap-1.5">
          {/* Price Box */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-[#E84E25]">₫</span>
              <span className="text-base sm:text-lg font-black text-[#141414] font-serif tracking-tight leading-none">
                {minPrice.toLocaleString()}
              </span>
            </div>
            {product.originalPriceVnd && (
              <span className="text-[10px] text-[#8C948E] line-through">
                {formatVnd(product.originalPriceVnd)}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {product.sampleReadSlug && onReadSample && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onReadSample(product.sampleReadSlug!);
                }}
                className="w-8 h-8 rounded-xl border border-black/15 bg-white text-[#08482D] hover:bg-[#08482D] hover:text-white transition-all duration-200 active:scale-95 flex items-center justify-center shadow-xs"
                title="Đọc thử sách online 3D KhoaVerse"
                aria-label={`Đọc thử sách ${product.name}`}
              >
                <BookOpen className="w-4 h-4" />
              </button>
            )}

            {onOpenRunway && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenRunway(product);
                }}
                className="w-8 h-8 rounded-xl border border-[#08482D]/20 bg-white text-[#08482D] hover:bg-[#08482D] hover:text-white transition-all duration-200 active:scale-95 flex items-center justify-center shadow-xs"
                title="Xem sàn diễn 3D Runway Lookbook"
                aria-label={`Xem sàn diễn 3D cho ${product.name}`}
              >
                <span className="font-['Michroma',sans-serif] text-[9px] font-bold">3D</span>
              </button>
            )}

            <button
              type="button"
              disabled={isOutOfStock}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(product);
              }}
              className={`h-8 px-3.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-1 shadow-xs ${
                isOutOfStock
                  ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed border border-zinc-300'
                  : 'bg-[#08482D] hover:bg-[#E84E25] text-white shadow-xs'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isOutOfStock ? 'Hết' : 'Mua'}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
