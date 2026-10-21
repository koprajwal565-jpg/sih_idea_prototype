import React, { useState } from 'react';
import { HelpCircle, MessageSquare, Send, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { apiRequest } from '../lib/api';

export const HelpSupport: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    {
      sender: 'ai',
      text: 'Hello! I am the FixNear Support Assistant. How can I assist you with pricing, cancellations, or booking status today?',
    },
  ]);
  const [isSending, setIsSending] = useState(false);

  const faqs = [
    {
      q: 'What is FixNear’s cancellation and refund policy?',
      a: 'You can cancel any booking free of charge as long as the technician has not been marked "On The Way". If cancelled while the technician is en-route, a minimal ₹49 dispatch fee applies. Any pre-authorized or completed payment will be refunded within 3-5 business days directly to your original payment method.',
    },
    {
      q: 'How are FixNear professionals verified?',
      a: 'Every independent tradesperson on FixNear must submit a valid Government ID (Aadhaar or PAN) and proof of trade competency. In addition, our administrative team conducts manual background reviews before assigning the "Verified Partner" badge.',
    },
    {
      q: 'How does payment work?',
      a: 'FixNear supports UPI (Google Pay, PhonePe, Paytm), Credit & Debit cards, and Net Banking via Razorpay. For academic and hackathon evaluation, a 1-click Demo Mode is also available without any real money deduction.',
    },
    {
      q: 'Are replacement parts and materials included in the base rate?',
      a: 'The base rate covers skilled diagnosis, inspection, and labor. If replacement spare parts (e.g. fan capacitors, water mixer cartridges, flush siphon valves) are required, the technician will present an itemized estimate for your approval before installation.',
    },
  ];

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userText = chatMessage.trim();
    setChatHistory((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatMessage('');
    setIsSending(true);

    try {
      const res = await apiRequest('/ai/customer-support', {
        method: 'POST',
        body: JSON.stringify({ message: userText }),
      });
      if (res.success) {
        setChatHistory((prev) => [...prev, { sender: 'ai', text: res.data.response }]);
      }
    } catch {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'We are experiencing high traffic. For urgent booking queries, please email support@fixnear.in or call our Bengaluru desk.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Help & Support Desk</h1>
        <p className="text-sm text-stone-600">
          Find instant answers to frequently asked questions or chat with our automated support assistant.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* FAQs */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-brand-600" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-stone-200 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4 font-semibold text-xs sm:text-sm text-stone-900 flex items-center justify-between gap-4"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-stone-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 flex-shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-stone-600 leading-relaxed border-t border-stone-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive AI Support Assistant */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-600" />
            <span>Ask Support Assistant</span>
          </h2>

          <Card className="flex flex-col h-[400px] overflow-hidden">
            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-brand-600 text-white rounded-br-none'
                        : 'bg-surface-100 text-stone-800 border border-stone-200 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendChat} className="p-3 border-t border-stone-200 flex gap-2 bg-white">
              <input
                type="text"
                placeholder="Ask about refunds, booking delays, pricing..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1 rounded-xl border border-stone-300 px-3 py-2 text-xs focus:outline-none focus:border-brand-500"
              />
              <Button type="submit" size="sm" isLoading={isSending}>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
