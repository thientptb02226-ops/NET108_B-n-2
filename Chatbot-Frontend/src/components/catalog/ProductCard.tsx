import React from 'react';
import { Product } from '../../types';
import { formatVnd } from '../../api';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ShoppingBag, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const minPrice = Math.min(...product.variants.map((v) => v.priceVnd));
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const isOutOfStock = totalStock === 0;

  return (
    <article
      className="group bg-white rounded-2xl border border-zinc-200/90 shadow-card hover-lift overflow-hidden flex flex-col h-full focus-within:ring-2 focus-within:ring-emerald-600 focus-within:ring-offset-2"
      aria-labelledby={`product-title-${product.id}`}
    >
      {/* Real Image Container with Aspect Ratio */}
      <div className="relative aspect-[4/3] bg-zinc-100 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400 bg-zinc-100">
            <ShoppingBag className="w-12 h-12 stroke-1" />
          </div>
        )}

        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <Badge variant="danger" size="sm">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Hết hàng
              </span>
            </Badge>
          ) : totalStock <= 5 ? (
            <Badge variant="warning" size="sm">
              Còn {totalStock} cái
            </Badge>
          ) : (
            <Badge variant="success" size="sm">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Còn hàng
              </span>
            </Badge>
          )}
        </div>
      </div>

      {/* Product Information */}
      <div className="p-5 flex flex-col flex-1">
        <h4
          id={`product-title-${product.id}`}
          className="text-base font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors line-clamp-1 mb-1.5"
        >
          {product.name}
        </h4>
        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mb-4 flex-1">
          {product.description}
        </p>

        {/* Price and Action */}
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs text-zinc-400 block font-medium">Giá từ</span>
            <span className="text-base font-extrabold text-zinc-900 tracking-tight">
              {formatVnd(minPrice)}
            </span>
          </div>

          <Button
            size="sm"
            variant={isOutOfStock ? 'outline' : 'primary'}
            disabled={isOutOfStock}
            onClick={() => onSelect(product)}
            className="shrink-0"
          >
            {isOutOfStock ? 'Tạm hết' : 'Chọn mua'}
          </Button>
        </div>
      </div>
    </article>
  );
};
