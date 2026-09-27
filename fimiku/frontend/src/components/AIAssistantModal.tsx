'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, ShieldAlert, Baby, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIAssistantModal({ isOpen, onClose }: AIAssistantModalProps) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: "Hello, welcome to Fimiku! I am your personal baby silicone product consultant. Tell me your baby's age or milestone (e.g. 4-month teething, 6-month weaning, bath playtime) and I will guide you with safe, certified food-grade silicone essentials.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "What is best for a 4-month teething baby?",
    "Which plate is recommended for baby-led weaning at 6 months?",
    "Can Fimiku silicone products be boiled or microwaved?",
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || prompt;
    if (!query.trim() || loading) return;

    const userText = query.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setPrompt('');
    setLoading(true);

    try {
      const res = await api.post('/ai/assistant/', { prompt: userText });
      setMessages((prev) => [...prev, { sender: 'ai', text: res.data.reply }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "We're currently updating our AI catalog guidance. For instant assistance, please explore our collection directly on the shop page!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-xl shadow-floating flex flex-col h-[85vh] sm:h-[600px] overflow-hidden border border-fimiku-lightBorder pb-safe sm:pb-0">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-fimiku-softLavender flex justify-between items-center border-b border-fimiku-lightBorder">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-fimiku-veryLightLavender rounded-2xl text-fimiku-cta border border-fimiku-lightPurple/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-fimiku-darkText flex items-center gap-1.5">
                Fimiku AI Advisor
                <span className="bg-fimiku-cta text-white text-[9px] font-bold px-2 py-0.5 rounded-full">LIVE</span>
              </h3>
              <p className="text-[11px] text-fimiku-grayText">100% Food-Grade Silicone Consultation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-fimiku-grayText hover:text-fimiku-darkText rounded-full hover:bg-fimiku-veryLightLavender transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-fimiku-softLavender/60 text-sm">
          {messages.map((m, index) => (
            <div
              key={index}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`p-3.5 sm:p-4 rounded-2xl max-w-[85%] text-xs sm:text-sm whitespace-pre-line leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-fimiku-cta text-white rounded-tr-none shadow-sm'
                    : 'bg-white text-fimiku-darkText shadow-sm border border-fimiku-lightBorder rounded-tl-none'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="p-3 bg-white rounded-2xl border border-fimiku-lightBorder text-xs text-fimiku-cta flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin" /> Consulting Fimiku silicone safety database...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2.5 bg-white border-t border-fimiku-lightBorder flex items-center gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp)}
              className="px-3 py-1.5 bg-fimiku-veryLightLavender hover:bg-fimiku-lavenderCard text-fimiku-cta text-[11px] font-medium rounded-full border border-fimiku-lightPurple/40 whitespace-nowrap transition"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-fimiku-lightBorder flex items-center gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about baby silicone teethers, safety, care..."
            className="flex-1 px-4 py-2.5 bg-fimiku-softLavender border border-fimiku-lightBorder rounded-full text-xs text-fimiku-darkText focus:outline-none focus:border-fimiku-primary"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !prompt.trim()}
            className="p-2.5 bg-fimiku-cta hover:bg-fimiku-primary text-white rounded-full transition disabled:opacity-40 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
