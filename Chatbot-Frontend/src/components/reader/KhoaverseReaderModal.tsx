import React, { useState, useEffect, useMemo } from 'react';
import { SampleBook, BookmarkData } from '../../types';
import { formatVnd } from '../../api';
import {
  X,
  ArrowLeft,
  ArrowRight,
  List,
  Bookmark,
  Moon,
  Sun,
  ShoppingBag,
  Edit3,
} from 'lucide-react';
import { KhoaverseAudioPlayer } from './KhoaverseAudioPlayer';

interface KhoaverseReaderModalProps {
  book: SampleBook | null;
  isOpen: boolean;
  onClose: () => void;
  onBuyBook: (productId?: string) => void;
  onBackToLibrary: () => void;
}

interface PageDef {
  type: 'cover' | 'intro' | 'toc' | 'chapter' | 'ending';
  chapterNumber?: number;
  chapterTitle?: string;
  paragraphs?: string[];
}

export const KhoaverseReaderModal: React.FC<KhoaverseReaderModalProps> = ({
  book,
  isOpen,
  onClose,
  onBuyBook,
  onBackToLibrary,
}) => {
  if (!isOpen || !book) return null;

  // Responsive: 1-page on mobile (<768px), 2-page on desktop
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const checkMob = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMob);
    return () => window.removeEventListener('resize', checkMob);
  }, []);

  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  // TOC drawer open
  const [isTocOpen, setIsTocOpen] = useState(false);

  // Bookmarks state (persisted to localStorage)
  const bookmarkStorageKey = `net108-bookmark-${book.slug}`;
  const [bookmarks, setBookmarks] = useState<Record<number, BookmarkData>>(() => {
    try {
      const saved = localStorage.getItem(bookmarkStorageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [activeBookmarkColor, setActiveBookmarkColor] = useState('#ffe46b'); // yellow default
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');

  // Save bookmarks
  useEffect(() => {
    try {
      localStorage.setItem(bookmarkStorageKey, JSON.stringify(bookmarks));
    } catch {}
  }, [bookmarks, bookmarkStorageKey]);

  // Build linear pages array
  const pages: PageDef[] = useMemo(() => {
    const list: PageDef[] = [];
    // Page 0: Cover
    list.push({ type: 'cover' });
    // Page 1: Intro / License
    list.push({ type: 'intro' });
    // Page 2: Table of Contents
    list.push({ type: 'toc' });

    // Chapters
    book.chapters.forEach((ch) => {
      ch.pages.forEach((pageParagraphs) => {
        list.push({
          type: 'chapter',
          chapterNumber: ch.chapterNumber,
          chapterTitle: ch.title,
          paragraphs: pageParagraphs,
        });
      });
    });

    // Final Page: Ending & Buy Physical Book
    list.push({ type: 'ending' });
    return list;
  }, [book]);

  // Current page index (in 2-page mode, index is always even: 0, 2, 4...)
  const [pageIndex, setPageIndex] = useState(0);

  // Navigation
  const step = isMobile ? 1 : 2;
  const maxIndex = isMobile ? pages.length - 1 : Math.max(0, pages.length - 2);

  const goNext = () => {
    setPageIndex((prev) => Math.min(maxIndex, prev + step));
  };

  const goPrev = () => {
    setPageIndex((prev) => Math.max(0, prev - step));
  };

  const jumpToPage = (targetIndex: number) => {
    const adjusted = isMobile ? targetIndex : targetIndex % 2 === 0 ? targetIndex : targetIndex - 1;
    setPageIndex(Math.min(maxIndex, Math.max(0, adjusted)));
    setIsTocOpen(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goNext();
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goPrev();
        e.preventDefault();
      } else if (e.key === 'Escape') {
        if (isTocOpen) setIsTocOpen(false);
        else onClose();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [maxIndex, step, isTocOpen, onClose]);

  // Toggle bookmark on current visible page
  const currentPageForBookmark = pageIndex;
  const hasCurrentBookmark = !!bookmarks[currentPageForBookmark];

  const handleToggleBookmark = () => {
    setBookmarks((prev) => {
      const copy = { ...prev };
      if (copy[currentPageForBookmark]) {
        delete copy[currentPageForBookmark];
      } else {
        copy[currentPageForBookmark] = {
          pageIndex: currentPageForBookmark,
          color: activeBookmarkColor,
          note: '',
          createdAt: new Date().toISOString(),
        };
      }
      return copy;
    });
  };

  const handleSaveNote = () => {
    if (!bookmarks[currentPageForBookmark]) {
      handleToggleBookmark();
    }
    setBookmarks((prev) => ({
      ...prev,
      [currentPageForBookmark]: {
        ...prev[currentPageForBookmark],
        note: noteText,
      },
    }));
    setIsNoteModalOpen(false);
  };

  // Page renderer helper
  const renderPage = (pDef: PageDef | undefined, idx: number, side: 'l' | 'r' | 'single') => {
    if (!pDef) {
      return (
        <div className={`pg ${side === 'l' ? 'l' : side === 'r' ? 'r' : ''} no`}>
          <div className="empty-page" />
        </div>
      );
    }

    const hasBookmark = !!bookmarks[idx];
    const bookmarkData = bookmarks[idx];

    return (
      <div
        className={`pg ${side === 'l' ? 'l' : side === 'r' ? 'r' : ''} ${
          hasBookmark ? 'has-reader-bookmark' : ''
        }`}
        data-page={idx}
      >
        {/* Bookmark Tag Indicator */}
        {hasBookmark && (
          <div
            className="absolute top-0 right-4 w-5 h-9 rounded-b-sm shadow-md flex items-center justify-center text-white"
            style={{ backgroundColor: bookmarkData?.color || '#bd3f45' }}
            title={bookmarkData?.note ? `Ghi chú: ${bookmarkData.note}` : 'Đã đánh dấu trang'}
          >
            <Bookmark className="w-3 h-3 fill-current text-white/90" />
          </div>
        )}

        {/* 1. COVER PAGE */}
        {pDef.type === 'cover' && (
          <div className="h-full flex flex-col justify-between text-center py-6 px-4 select-none">
            <div className="rk tracking-widest text-xs uppercase font-sans font-bold text-zinc-500">
              Net108Khai · Thư Viện Đọc Mẫu
            </div>
            <div className="my-auto space-y-4">
              <span className="inline-block px-3 py-1 bg-amber-100/80 text-amber-900 border border-amber-300 rounded-full text-[11px] font-semibold tracking-wider uppercase font-sans">
                {book.category}
              </span>
              <h1 className="rt text-2xl sm:text-3xl font-serif font-bold text-[#141414] leading-tight">
                {book.title}
              </h1>
              {book.subtitle && (
                <p className="font-serif italic text-sm text-zinc-600">{book.subtitle}</p>
              )}
              <div className="pt-2 font-sans text-xs font-semibold text-zinc-700 tracking-wider uppercase">
                Tác giả: <span className="font-bold text-[#1F3FB0]">{book.author}</span>
              </div>
            </div>
            <div className="text-[11px] text-zinc-400 font-sans">
              Năm xuất bản: {book.publishedYear} · Bản in chính thức tại Net108Khai
            </div>
          </div>
        )}

        {/* 2. INTRO / LICENSE PAGE */}
        {pDef.type === 'intro' && (
          <div className="h-full flex flex-col justify-between py-6 px-4">
            <div className="rk font-sans text-xs font-bold text-zinc-500 uppercase tracking-widest">
              Giới thiệu & Quyền đọc mẫu
            </div>
            <div className="space-y-4 my-auto">
              <h3 className="font-serif text-lg font-bold text-[#141414]">Tóm tắt nội dung</h3>
              <p className="font-serif text-xs sm:text-sm text-zinc-700 leading-relaxed text-justify indent-4">
                {book.synopsis}
              </p>
              <div className="p-3 bg-black/5 rounded-xl border border-black/5 text-[11px] text-zinc-600 space-y-1 font-sans">
                <div className="font-bold text-zinc-800">Thông báo bản quyền:</div>
                <div>{book.licenseNote}</div>
              </div>
            </div>
            <div className="text-[11px] text-zinc-400 font-sans text-center">
              Nhấn mũi tên hoặc dùng phím ← → để chuyển trang
            </div>
          </div>
        )}

        {/* 3. TABLE OF CONTENTS PAGE */}
        {pDef.type === 'toc' && (
          <div className="h-full flex flex-col justify-between py-6 px-4">
            <div className="rk font-sans text-xs font-bold text-zinc-500 uppercase tracking-widest">
              Mục lục đọc mẫu
            </div>
            <div className="my-auto space-y-3">
              <h3 className="font-serif text-lg font-bold text-[#141414] mb-2 text-center">
                Danh Sách Chương
              </h3>
              <ul className="space-y-2.5">
                {book.chapters.map((ch, cIdx) => (
                  <li key={ch.id}>
                    <button
                      onClick={() => jumpToPage(3 + cIdx * 2)}
                      className="w-full p-2.5 rounded-lg bg-black/5 hover:bg-black/10 text-left flex items-center justify-between text-xs transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-bold text-zinc-400 group-hover:text-[#1F3FB0]">
                          0{ch.chapterNumber}
                        </span>
                        <span className="font-serif font-bold text-zinc-800">{ch.title}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-sans group-hover:text-zinc-700">
                        Đọc →
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-[10px] text-zinc-400 font-sans text-center">
              Chọn chương để nhảy đến trang đọc
            </div>
          </div>
        )}

        {/* 4. CHAPTER READING PAGE */}
        {pDef.type === 'chapter' && (
          <div className="h-full flex flex-col justify-between py-6 px-4">
            <div className="flex items-center justify-between text-[11px] font-sans font-bold text-zinc-400 uppercase tracking-wider pb-2 border-b border-black/5">
              <span>Chương {pDef.chapterNumber}</span>
              <span className="truncate max-w-[150px]">{pDef.chapterTitle}</span>
            </div>

            <div className="my-auto space-y-3 overflow-y-auto pr-1">
              {pDef.paragraphs?.map((pText, pIdx) => (
                <p
                  key={pIdx}
                  className="font-serif text-xs sm:text-sm text-zinc-800 leading-relaxed text-justify indent-6 selection:bg-amber-200"
                >
                  {pText}
                </p>
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] font-sans text-zinc-400 pt-2 border-t border-black/5">
              <span>{book.title}</span>
              <span className="font-mono">{idx + 1}</span>
            </div>
          </div>
        )}

        {/* 5. ENDING PAGE */}
        {pDef.type === 'ending' && (
          <div className="h-full flex flex-col justify-between text-center py-6 px-4">
            <div className="rk font-sans text-xs font-bold text-zinc-500 uppercase tracking-widest">
              Kết thúc phần đọc mẫu
            </div>
            <div className="my-auto space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl">
                ✓
              </div>
              <h3 className="font-serif text-xl font-bold text-[#141414]">
                Bạn vừa hoàn thành phần đọc thử
              </h3>
              <p className="font-serif text-xs sm:text-sm text-zinc-600 max-w-xs mx-auto">
                Để thưởng thức trọn vẹn toàn bộ tác phẩm cùng tranh minh họa và chất lượng giấy ngà cao cấp, bạn có thể đặt mua bản sách giấy chính hãng tại Net108Khai Store.
              </p>
              {book.physicalProductPriceVnd && (
                <div className="text-sm font-extrabold text-emerald-700">
                  Giá sách giấy: {formatVnd(book.physicalProductPriceVnd)}
                </div>
              )}
              <div className="pt-2 flex flex-col gap-2 max-w-xs mx-auto">
                <button
                  onClick={() => onBuyBook(book.physicalProductId)}
                  className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Mua Sách Giấy Ngay</span>
                </button>
                <button
                  onClick={onBackToLibrary}
                  className="w-full py-2 px-4 bg-black/5 hover:bg-black/10 text-zinc-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Quay lại thư viện sách
                </button>
              </div>
            </div>
            <div className="text-[10px] text-zinc-400 font-sans">
              Net108Khai AI Native Commerce · Giao hàng toàn quốc
            </div>
          </div>
        )}
      </div>
    );
  };

  const leftPageDef = pages[pageIndex];
  const rightPageDef = pages[pageIndex + 1];

  return (
    <div
      className={`rdr on fixed inset-0 z-50 flex items-center justify-center ${
        isDarkMode ? 'theme-dark' : ''
      }`}
      style={{
        background: isDarkMode
          ? 'radial-gradient(ellipse at 50% 35%, #2d3544, #0b0e14 78%)'
          : 'radial-gradient(ellipse at 50% 35%, #4a3a2c, #17110c 78%)',
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Trình đọc sách: ${book.title}`}
    >
      {/* Top Left Navigation Buttons: Close & Back to Store */}
      <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
        <button
          onClick={onClose}
          id="rdx"
          className="box lbl px-3 py-1.5 rounded-lg bg-[#F4F2ED] text-[#141414] hover:bg-white text-xs font-bold shadow-md flex items-center gap-1 min-h-[44px]"
          title="Đóng trình đọc sách (Esc)"
        >
          <X className="w-4 h-4" />
          <span>Đóng</span>
        </button>

        <button
          onClick={onBackToLibrary}
          className="box lbl px-3 py-1.5 rounded-lg bg-black/40 text-white hover:bg-black/60 text-xs font-semibold backdrop-blur-md min-h-[44px] flex items-center gap-1"
          title="Về kệ sách thư viện"
        >
          <span>← Kệ sách</span>
        </button>
      </div>

      {/* Top Right: Link to buy physical book */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {book.physicalProductPriceVnd && (
          <button
            onClick={() => onBuyBook(book.physicalProductId)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 min-h-[44px] transition-all"
            title="Mua sách giấy nguyên bản tại cửa hàng"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mua sách giấy</span>
            <span>({formatVnd(book.physicalProductPriceVnd)})</span>
          </button>
        )}
      </div>

      {/* Book Container with 3D shadow */}
      <div className={`bk ${isMobile ? 'one' : 'two'}`} id="bk">
        {isMobile ? (
          renderPage(leftPageDef, pageIndex, 'single')
        ) : (
          <>
            {renderPage(leftPageDef, pageIndex, 'l')}
            {renderPage(rightPageDef, pageIndex + 1, 'r')}
          </>
        )}
      </div>

      {/* Left Navigation Arrow */}
      <button
        onClick={goPrev}
        disabled={pageIndex === 0}
        id="rdp"
        className="rnv p fixed left-4 sm:left-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/80 hover:bg-white text-zinc-900 flex items-center justify-center shadow-lg disabled:opacity-20 disabled:cursor-not-allowed transition-all z-40 min-h-[44px] min-w-[44px]"
        aria-label="Trang trước"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Right Navigation Arrow */}
      <button
        onClick={goNext}
        disabled={pageIndex >= maxIndex}
        id="rdn"
        className="rnv n fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/80 hover:bg-white text-zinc-900 flex items-center justify-center shadow-lg disabled:opacity-20 disabled:cursor-not-allowed transition-all z-40 min-h-[44px] min-w-[44px]"
        aria-label="Trang sau"
      >
        <ArrowRight className="w-5 h-5" />
      </button>

      {/* Page Indicator */}
      <div className="rin lbl fixed bottom-14 left-1/2 -translate-x-1/2 text-white/80 text-xs font-mono font-semibold z-30 select-none">
        {isMobile
          ? `Trang ${pageIndex + 1} / ${pages.length}`
          : `Trang ${pageIndex + 1}–${Math.min(pages.length, pageIndex + 2)} / ${pages.length}`}
      </div>

      {/* Bottom Reader Tools Toolbar (.rdtools) matching KhoaVerse */}
      <nav
        className="rdtools bg-[#F4F2ED]/95 text-[#141414] border border-black/10 rounded-full px-3 py-1 shadow-elevation backdrop-blur-md flex items-center gap-1.5 z-40"
        aria-label="Thanh điều khiển đọc sách"
      >
        {/* TOC Drawer Toggle */}
        <button
          onClick={() => setIsTocOpen(!isTocOpen)}
          id="rdtoc"
          title="Mục lục chương"
          aria-label="Mục lục chương"
          className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full hover:bg-black/5"
        >
          <List className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Mục lục</span>
        </button>

        <span className="rd-split h-4 w-px bg-zinc-400/40" />

        {/* MP3 Audio Player Controls */}
        <KhoaverseAudioPlayer />

        <span className="rd-split h-4 w-px bg-zinc-400/40" />

        {/* Theme Dark/Light Mode */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          id="rdtheme"
          title={isDarkMode ? 'Bật chế độ sáng' : 'Bật chế độ tối ban đêm'}
          aria-label="Đổi chế độ sáng tối"
          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
        </button>

        <span className="rd-split h-4 w-px bg-zinc-400/40" />

        {/* Bookmark Action */}
        <button
          onClick={handleToggleBookmark}
          id="rdmark"
          title={hasCurrentBookmark ? 'Bỏ đánh dấu trang' : 'Đánh dấu trang này'}
          aria-label="Đánh dấu trang"
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
            hasCurrentBookmark ? 'text-red-600' : 'hover:bg-black/5 text-[#141414]'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${hasCurrentBookmark ? 'fill-current' : ''}`} />
        </button>

        {/* Note on Bookmark */}
        {hasCurrentBookmark && (
          <button
            onClick={() => {
              setNoteText(bookmarks[currentPageForBookmark]?.note || '');
              setIsNoteModalOpen(true);
            }}
            title="Thêm ghi chú cho trang này"
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/5 text-zinc-600"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}
      </nav>

      {/* Table of Contents Drawer */}
      {isTocOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsTocOpen(false)}
        >
          <div
            className="bg-[#F4F2ED] text-[#141414] rounded-2xl border border-black/10 shadow-elevation max-w-sm w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Mục lục sách"
          >
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <h3 className="font-bold text-base font-serif">Mục Lục Tác Phẩm</h3>
              <button
                onClick={() => setIsTocOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-black/5 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <button
                onClick={() => jumpToPage(0)}
                className="w-full p-2.5 rounded-lg text-left text-xs bg-white/70 hover:bg-white flex items-center justify-between"
              >
                <span className="font-serif font-bold">Trang bìa</span>
                <span className="text-[10px] text-zinc-400">Trang 1</span>
              </button>
              <button
                onClick={() => jumpToPage(1)}
                className="w-full p-2.5 rounded-lg text-left text-xs bg-white/70 hover:bg-white flex items-center justify-between"
              >
                <span className="font-serif font-bold">Giới thiệu & Bản quyền</span>
                <span className="text-[10px] text-zinc-400">Trang 2</span>
              </button>
              {book.chapters.map((ch, idx) => (
                <button
                  key={ch.id}
                  onClick={() => jumpToPage(3 + idx * 2)}
                  className="w-full p-2.5 rounded-lg text-left text-xs bg-white/70 hover:bg-white flex items-center justify-between"
                >
                  <span className="font-serif font-bold">
                    Chương {ch.chapterNumber}: {ch.title}
                  </span>
                  <span className="text-[10px] text-zinc-400">Trang {4 + idx * 2}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Note Modal for Bookmark */}
      {isNoteModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsNoteModalOpen(false)}
        >
          <div
            className="bg-[#F4F2ED] text-[#141414] rounded-2xl border border-black/10 shadow-elevation max-w-sm w-full p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Ghi chú dấu trang"
          >
            <div className="flex items-center justify-between border-b border-black/10 pb-2">
              <h4 className="font-bold text-sm font-serif">Ghi chú cho trang sách</h4>
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="w-6 h-6 rounded-full hover:bg-black/5 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Nhập cảm nhận hoặc lưu ý cho trang này..."
              rows={3}
              className="w-full p-2.5 rounded-xl border border-black/10 bg-white text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#1F3FB0]"
            />

            <div className="flex items-center justify-between pt-1">
              {/* Highlight color picker */}
              <div className="flex items-center gap-1.5">
                {['#ffe46b', '#a9e8ac', '#ffc1d9', '#b7d9ff'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setActiveBookmarkColor(c)}
                    className={`w-5 h-5 rounded-full border border-black/20 ${
                      activeBookmarkColor === c ? 'ring-2 ring-black/40 scale-110' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleSaveNote}
                className="px-3.5 py-1.5 rounded-lg bg-[#1F3FB0] text-white text-xs font-bold hover:bg-blue-800"
              >
                Lưu ghi chú
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
