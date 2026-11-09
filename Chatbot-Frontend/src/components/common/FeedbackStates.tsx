import React from 'react';
import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import { Button } from './Button';

// 1. Loading Skeleton
export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-card p-4 space-y-4">
    <div className="w-full h-48 bg-zinc-100 rounded-xl animate-shimmer" />
    <div className="space-y-2">
      <div className="w-3/4 h-5 bg-zinc-100 rounded animate-shimmer" />
      <div className="w-1/2 h-4 bg-zinc-100 rounded animate-shimmer" />
    </div>
    <div className="pt-2 flex items-center justify-between">
      <div className="w-24 h-6 bg-zinc-100 rounded animate-shimmer" />
      <div className="w-28 h-9 bg-zinc-100 rounded-lg animate-shimmer" />
    </div>
  </div>
);

// 2. Empty State (Quy-luat-content-viet + UI-UX-Pro-Max)
interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Chưa có dữ liệu',
  description = 'Hiện tại không có mục nào để hiển thị trong danh sách này.',
  actionText,
  onAction,
  icon = <Inbox className="w-12 h-12 text-zinc-400 stroke-1" />,
}) => (
  <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white rounded-2xl border border-zinc-200 shadow-card max-w-md mx-auto my-6">
    <div className="w-16 h-16 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-zinc-900 mb-1">{title}</h3>
    <p className="text-sm text-zinc-600 mb-6 max-w-sm leading-relaxed">{description}</p>
    {actionText && onAction && (
      <Button variant="primary" onClick={onAction}>
        {actionText}
      </Button>
    )}
  </div>
);

// 3. Error State
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Không thể tải dữ liệu',
  message = 'Đã có sự cố kết nối tới máy chủ. Bạn vui lòng thử lại sau vài giây.',
  onRetry,
}) => (
  <div className="flex flex-col items-center justify-center p-8 text-center bg-rose-50/50 rounded-2xl border border-rose-200/80 max-w-md mx-auto my-6">
    <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-3">
      <AlertCircle className="w-6 h-6 text-rose-600" />
    </div>
    <h3 className="text-base font-semibold text-rose-950 mb-1">{title}</h3>
    <p className="text-sm text-rose-700 mb-4 max-w-xs">{message}</p>
    {onRetry && (
      <Button variant="outline" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={onRetry}>
        Thử lại ngay
      </Button>
    )}
  </div>
);
