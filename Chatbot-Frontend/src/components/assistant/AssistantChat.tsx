import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Product } from '../../types';
import { api, formatVnd } from '../../api';
import { Button } from '../common/Button';
import { Send, Bot, User, Sparkles, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';

interface AssistantChatProps {
  onSelectProduct: (product: Product) => void;
}

export const AssistantChat: React.FC<AssistantChatProps> = ({ onSelectProduct }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content:
        'Chào bạn! Mình là trợ lý mua sắm AI của Net108Khai. Bạn đang tìm kiếm sản phẩm gì (áo thun, bình giữ nhiệt, balo, tai nghe...)? Hãy cho mình biết nhé!',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const query = input.trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.askAssistant(query);
      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        content: response.answer,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        products: response.products,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Dịch vụ trợ lý tạm thời gián đoạn.';
      const botMsg: ChatMessage = {
        id: 'bot-err-' + Date.now(),
        sender: 'assistant',
        content: 'Rất tiếc, đã có sự cố kết nối tới dịch vụ AI. Bạn hãy thử lại sau ít giây.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        error: errorMsg,
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    'Tìm áo thun cotton dưới 200 nghìn',
    'Bình giữ nhiệt nào tốt?',
    'Balo đựng được laptop 15.6 inch?',
    'Tai nghe chống ồn giá bao nhiêu?',
  ];

  return (
    <div className="flex flex-col h-[600px] max-w-3xl mx-auto bg-white rounded-3xl border border-zinc-200/90 shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-zinc-900">Trợ Lý Mua Sắm AI</h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                <Sparkles className="w-3 h-3 text-emerald-600" /> Trực tuyến
              </span>
            </div>
            <p className="text-xs text-zinc-500">Tư vấn thông tin sản phẩm và kiểm tra tồn kho tức thì</p>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-md rounded-2xl p-4 text-sm leading-relaxed space-y-3 ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-sm shadow-sm'
                  : 'bg-zinc-100/80 text-zinc-800 rounded-tl-sm border border-zinc-200/60'
              }`}
            >
              <p className="whitespace-pre-line">{msg.content}</p>

              {msg.error && (
                <div className="flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200/60">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{msg.error}</span>
                </div>
              )}

              {/* Render Recommended Products with Live Stock & Price */}
              {msg.products && msg.products.length > 0 && (
                <div className="pt-2 space-y-2 border-t border-zinc-200/70">
                  <span className="text-xs font-bold text-zinc-700 block">Sản phẩm gợi ý:</span>
                  <div className="space-y-2">
                    {msg.products.map((p) => {
                      const minPrice = Math.min(...p.variants.map((v) => v.priceVnd));
                      return (
                        <div
                          key={p.id}
                          className="bg-white rounded-xl p-3 border border-zinc-200 shadow-sm flex items-center justify-between gap-3 text-zinc-900"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-zinc-100 shrink-0 overflow-hidden">
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <ShoppingBag className="w-5 h-5 text-zinc-400 m-2.5" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold truncate text-zinc-900">{p.name}</h5>
                              <span className="text-xs font-extrabold text-emerald-700">
                                {formatVnd(minPrice)}
                              </span>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant="primary"
                            className="text-xs py-1 px-3 shrink-0"
                            onClick={() => onSelectProduct(p)}
                            icon={<ArrowRight className="w-3.5 h-3.5" />}
                          >
                            Xem
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <span
                className={`text-[10px] block text-right ${
                  msg.sender === 'user' ? 'text-emerald-100' : 'text-zinc-400'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 items-center text-xs text-zinc-500">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-zinc-100 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5 border border-zinc-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse delay-150" />
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse delay-300" />
              <span className="ml-1">Đang tìm thông tin trong kho...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-6 py-2 border-t border-zinc-100 flex gap-2 overflow-x-auto bg-zinc-50/50">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInput(q);
            }}
            className="text-xs whitespace-nowrap bg-white hover:bg-zinc-100 text-zinc-700 px-3 py-1.5 rounded-full border border-zinc-200 transition-colors shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 border-t border-zinc-200 flex gap-2 bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập câu hỏi của bạn (ví dụ: Tìm áo thun size M dưới 200k)..."
          className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
          disabled={isLoading}
        />
        <Button
          type="submit"
          variant="primary"
          disabled={!input.trim() || isLoading}
          icon={<Send className="w-4 h-4" />}
        >
          Gửi
        </Button>
      </form>
    </div>
  );
};
