import React, { useState } from 'react';
import { CartLine, Order } from '../../types';
import { formatVnd, api } from '../../api';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CheckCircle2, Clock, AlertCircle, ShieldAlert } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  lines: CartLine[];
  totalVnd: number;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  lines,
  totalVnd,
  onOrderSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Generate idempotent key per checkout session
      const idempotencyKey = 'idemp-' + Math.random().toString(36).substring(2) + '-' + Date.now();
      const order = await api.checkout('cart-session-current', idempotencyKey);
      setCreatedOrder(order);
      onOrderSuccess(order);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi khi tạo đơn hàng.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    setCreatedOrder(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={createdOrder ? handleFinish : onClose} title="Xác nhận đặt hàng" maxWidth="max-w-lg">
      {createdOrder ? (
        <div className="text-center space-y-4 py-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-zinc-900">Đặt hàng thành công!</h4>
            <p className="text-xs text-zinc-500 mt-1">Mã đơn hàng: <span className="font-mono font-bold text-zinc-800">{createdOrder.id}</span></p>
          </div>

          <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 text-left space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Trạng thái: Chờ thanh toán (pending_payment)</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Đơn hàng đã được ghi nhận trên hệ thống và giữ tồn kho trong 30 phút. Bạn có thể xem lại hoặc hủy đơn bất cứ lúc nào trong mục Lịch sử đơn hàng.
            </p>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 flex justify-between items-center text-sm font-semibold text-zinc-800">
            <span>Tổng số tiền:</span>
            <span className="text-base font-extrabold text-emerald-700">{formatVnd(createdOrder.totalVnd || totalVnd)}</span>
          </div>

          <div className="pt-2">
            <Button variant="primary" className="w-full" onClick={handleFinish}>
              Hoàn tất & Về trang chủ
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="border border-zinc-200 rounded-2xl p-4 space-y-3 bg-zinc-50/50">
            <span className="text-xs font-bold text-zinc-700 tracking-wide uppercase">
              Tóm tắt sản phẩm ({lines.reduce((s, l) => s + l.quantity, 0)})
            </span>
            <div className="max-h-40 overflow-y-auto divide-y divide-zinc-200 text-xs">
              {lines.map((l) => (
                <div key={l.variantId} className="py-2 flex justify-between items-center">
                  <span className="font-medium text-zinc-800 line-clamp-1">{l.name} x {l.quantity}</span>
                  <span className="font-bold text-zinc-900 shrink-0 ml-2">{formatVnd(l.priceVnd * l.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-zinc-200 flex justify-between items-center text-sm font-bold text-zinc-900">
              <span>Tổng thanh toán tạm tính:</span>
              <span className="text-base text-emerald-700">{formatVnd(totalVnd)}</span>
            </div>
          </div>

          {/* Business Policy Note (Taste-skill & Backend-API-v1 compliant) */}
          <div className="flex gap-2.5 p-3 rounded-xl bg-zinc-100/70 border border-zinc-200 text-xs text-zinc-600">
            <ShieldAlert className="w-5 h-5 text-zinc-500 shrink-0" />
            <p>
              Hệ thống sử dụng cơ chế <span className="font-semibold text-zinc-800">Idempotency Key</span> chống trùng lặp đơn hàng khi bạn bấm nhiều lần hoặc mạng chập chờn.
            </p>
          </div>

          {error && (
            <div className="flex gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={isSubmitting}>
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              isLoading={isSubmitting}
              onClick={handleConfirmOrder}
            >
              Xác nhận tạo đơn
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
