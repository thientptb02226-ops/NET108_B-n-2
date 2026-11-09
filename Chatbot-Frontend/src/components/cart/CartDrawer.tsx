import React from 'react';
import { CartLine } from '../../types';
import { formatVnd } from '../../api';
import { Button } from '../common/Button';
import { EmptyState } from '../common/FeedbackStates';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lines: CartLine[];
  totalVnd: number;
  onUpdateQuantity: (variantId: string, delta: number) => void;
  onRemoveItem: (variantId: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  lines,
  totalVnd,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-zinc-900/40 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-zinc-200 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-zinc-900">Giỏ hàng của bạn</h3>
              <span className="text-xs bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full font-bold">
                {lines.reduce((s, l) => s + l.quantity, 0)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              aria-label="Đóng giỏ hàng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {lines.length === 0 ? (
              <EmptyState
                title="Giỏ hàng trống"
                description="Bạn chưa thêm sản phẩm nào vào giỏ. Hãy dạo một vòng xem các sản phẩm nhé!"
                actionText="Khám phá ngay"
                onAction={onClose}
              />
            ) : (
              <div className="divide-y divide-zinc-100">
                {lines.map((line) => (
                  <div key={line.variantId} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                    <div className="flex-1 space-y-1">
                      <h4 className="text-sm font-semibold text-zinc-900 line-clamp-1">{line.name}</h4>
                      <p className="text-xs text-zinc-400">SKU: {line.sku}</p>
                      <div className="text-sm font-bold text-emerald-700 pt-1">
                        {formatVnd(line.priceVnd)}
                      </div>

                      {/* Quantity adjustment */}
                      <div className="flex items-center gap-3 pt-2">
                        <div className="flex items-center border border-zinc-200 rounded-lg p-0.5 bg-zinc-50">
                          <button
                            onClick={() => onUpdateQuantity(line.variantId, -1)}
                            className="w-7 h-7 rounded flex items-center justify-center text-zinc-600 hover:bg-white transition-colors"
                            aria-label="Giảm 1"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-zinc-800">
                            {line.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(line.variantId, 1)}
                            className="w-7 h-7 rounded flex items-center justify-center text-zinc-600 hover:bg-white transition-colors"
                            aria-label="Tăng 1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(line.variantId)}
                          className="text-zinc-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                          aria-label="Xóa sản phẩm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-zinc-900">
                        {formatVnd(line.priceVnd * line.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with Total and Checkout */}
          {lines.length > 0 && (
            <div className="p-6 border-t border-zinc-100 bg-zinc-50 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-500 font-medium block">Tạm tính (chưa tính ship)</span>
                  <span className="text-xl font-extrabold text-zinc-900">{formatVnd(totalVnd)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold border border-emerald-200/60">
                  <ShieldCheck className="w-4 h-4" /> Giá minh bạch
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                icon={<ArrowRight className="w-5 h-5" />}
                onClick={() => {
                  onClose();
                  onCheckout();
                }}
              >
                Tiến hành thanh toán
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
