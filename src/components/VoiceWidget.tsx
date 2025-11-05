import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Types
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
}

// Constants
const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://n8n.srv998244.hstgr.cloud/webhook/plumberpro-chat';
const CONVERSATION_ID_KEY = 'plumberpro_conversation_id';
const CUSTOMER_INFO_KEY = 'plumberpro_customer_info';

// WARNING: Storing PII in localStorage poses privacy and compliance risks
// In production, consider: sessionStorage, encryption, or server-side storage
// localStorage is not encrypted and persists across browser sessions

export default function VoiceWidget() {
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [conversationId, setConversationId] = useState<string>('');

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize conversation ID and customer info from localStorage
  useEffect(() => {
    const storedConversationId = localStorage.getItem(CONVERSATION_ID_KEY);
    const storedCustomerInfo = localStorage.getItem(CUSTOMER_INFO_KEY);

    if (storedConversationId) {
      setConversationId(storedConversationId);
    }

    if (storedCustomerInfo) {
      try {
        setCustomerInfo(JSON.parse(storedCustomerInfo));
      } catch (e) {
        console.error('Failed to parse customer info:', e);
      }
    }
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpen = () => {
    setIsOpen(true);
    // Check if we should show customer info form
    if (!customerInfo && messages.length === 0) {
      setShowCustomerForm(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleCustomerInfoSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const info: CustomerInfo = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
    };

    setCustomerInfo(info);

    // Store customer info in localStorage with error handling
    try {
      localStorage.setItem(CUSTOMER_INFO_KEY, JSON.stringify(info));
    } catch (error) {
      console.error('Failed to save customer info to localStorage:', error);
      // Continue even if localStorage fails - functionality should work without it
    }

    setShowCustomerForm(false);

    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: `Hi ${info.name}! Thanks for reaching out. How can I help you today?`,
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return;

    const messageText = inputValue.trim();
    setInputValue('');

    // Generate conversation ID if first message
    let convId = conversationId;
    if (!convId) {
      convId = uuidv4();
      setConversationId(convId);

      // Store conversation ID in localStorage with error handling
      try {
        localStorage.setItem(CONVERSATION_ID_KEY, convId);
      } catch (error) {
        console.error('Failed to save conversation ID to localStorage:', error);
        // Continue even if localStorage fails - conversation will still work
      }
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Send to webhook
    setIsSending(true);
    setIsTyping(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          conversation_id: convId,
          customer_name: customerInfo?.name || 'Unknown',
          phone: customerInfo?.phone || null,
          email: customerInfo?.email || null,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Add AI response
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: data.response || data.reply || 'Thanks for your message. Someone will get back to you soon!',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Log additional data for debugging (development only - contains sensitive lead data)
      if (import.meta.env.DEV && (data.intent || data.urgency || data.lead_score)) {
        console.log('Lead classification:', {
          intent: data.intent,
          urgency: data.urgency,
          lead_score: data.lead_score,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);

      // Determine error type
      let errorContent = 'Sorry, there was an error sending your message. Please try again.';

      if (error instanceof Error && error.name === 'AbortError') {
        errorContent = 'Request timed out. Please check your internet connection and try again.';
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        errorContent = 'Unable to connect to our servers. Please check your internet connection and try again.';
      } else if (error instanceof Error && error.message.includes('HTTP')) {
        errorContent = 'Our chat service is temporarily unavailable. Please try again in a moment or call us directly.';
      }

      // Add error message
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Widget */}
      {isOpen ? (
        <div className="bg-white rounded-2xl shadow-2xl w-96 h-[600px] flex flex-col animate-slide-up overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold">PlumberPro Support</div>
                <div className="text-xs text-white/80">Usually replies instantly</div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="hover:bg-white/10 p-2 rounded-lg transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Customer Info Form */}
          {showCustomerForm && (
            <div className="p-6 border-b bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">Let's get started</h3>
              <form onSubmit={handleCustomerInfoSubmit} className="space-y-3">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john@example.com"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Start Chat
                </button>
              </form>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && !showCustomerForm && (
              <div className="text-center text-gray-500 mt-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">Send us a message to get started!</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-gray-200 text-gray-900 rounded-tr-sm'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-tl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  <span
                    className={`text-xs mt-1 block ${
                      message.role === 'user' ? 'text-gray-500' : 'text-white/70'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-white/70 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <div
                      className="w-2 h-2 bg-white/70 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <div
                      className="w-2 h-2 bg-white/70 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSending || showCustomerForm}
              />
              <button
                onClick={handleSendMessage}
                disabled={isSending || !inputValue.trim() || showCustomerForm}
                className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                aria-label="Send message"
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-2 text-center">
              Powered by PlumberPro AI
            </div>
          </div>
        </div>
      ) : (
        /* Floating Action Button */
        <button
          onClick={handleOpen}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 flex items-center justify-center group"
          aria-label="Open chat"
        >
          <MessageCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Mobile Responsive Styles */}
      <style>{`
        @media (max-width: 640px) {
          .fixed.bottom-6.right-6 {
            bottom: 1rem;
            right: 1rem;
          }

          .fixed.bottom-6.right-6 > div:first-child {
            width: calc(100vw - 2rem);
            height: calc(100vh - 2rem);
            max-width: 100%;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
