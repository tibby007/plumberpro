import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, Loader2, Mic, MicOff, User } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

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

// Design Tokens
const colors = {
  primary: '#3B82F6',
  primaryLight: '#EFF6FF',
  secondary: '#F3F4F6',
  success: '#10B981',
  danger: '#EF4444',
  text: '#1F2937',
  textLight: '#6B7280',
};

export default function EmbeddedChatWidget() {
  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [conversationId, setConversationId] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');

  const { toast } = useToast();

  // Initialize conversation ID and customer info from localStorage
  useEffect(() => {
    const storedConversationId = localStorage.getItem(CONVERSATION_ID_KEY);
    const storedCustomerInfo = localStorage.getItem(CUSTOMER_INFO_KEY);

    if (storedConversationId) {
      setConversationId(storedConversationId);
    }

    if (storedCustomerInfo) {
      try {
        const info = JSON.parse(storedCustomerInfo);
        setCustomerInfo(info);
        setShowCustomerForm(false);
        // Add welcome message
        const welcomeMessage: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: `Welcome back, ${info.name}! I'm Sarah, your virtual plumbing assistant. How can I help you today?`,
          timestamp: new Date().toISOString(),
        };
        setMessages([welcomeMessage]);
      } catch (e) {
        console.error('Failed to parse customer info:', e);
      }
    }
  }, []);

  // Ref to store handleSendMessage for use in speech recognition
  const handleSendMessageRef = useRef<(() => void) | null>(null);

  // Initialize Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');

        setInputValue(transcript);

        // Store final transcript for auto-send
        if (event.results[event.results.length - 1].isFinal) {
          finalTranscriptRef.current = transcript;
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        setIsListening(false);

        if (event.error === 'not-allowed') {
          toast({
            title: 'Microphone Access Denied',
            description: 'Please allow microphone access to use voice input.',
            variant: 'destructive',
          });
        } else if (event.error === 'no-speech') {
          toast({
            title: 'No Speech Detected',
            description: 'Please try speaking again.',
            variant: 'destructive',
          });
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        setIsListening(false);

        // Auto-send the transcribed message using ref
        setTimeout(() => {
          if (finalTranscriptRef.current.trim() && handleSendMessageRef.current) {
            handleSendMessageRef.current();
          }
        }, 500);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);

  // Auto-send message after voice recording completes
  // Temporarily disabled to prevent infinite loops
  // useEffect(() => {
  //   if (!isRecording && !isListening && finalTranscriptRef.current.trim() && inputValue.trim()) {
  //     // Small delay to ensure state updates
  //     const timeoutId = setTimeout(() => {
  //       handleSendMessage();
  //     }, 300);
  //     return () => clearTimeout(timeoutId);
  //   }
  // }, [isRecording, isListening, inputValue, handleSendMessage]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
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

    // Add welcome message with Sarah persona
    const welcomeMessage: ChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: `Hi ${info.name}! I'm Sarah, your virtual plumbing assistant. I'm here 24/7 to help with emergencies, quotes, or any plumbing questions. How can I help you today?`,
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isSending) return;

    const messageText = inputValue.trim();
    setInputValue('');
    finalTranscriptRef.current = ''; // Clear voice transcript after sending

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
        const errorText = await response.text();
        console.error('Response error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Parse JSON response safely
      const responseText = await response.text();
      if (import.meta.env.DEV) {
        console.log('Raw response:', responseText);
      }

      let data: { response?: string; reply?: string; intent?: string; urgency?: string; lead_score?: number };
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        if (import.meta.env.DEV) {
          console.log('Response text:', responseText);
        }
        // If JSON parsing fails, use default response
        data = { response: 'Thanks for your message. Someone will get back to you soon!' };
      }

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

      let errorContent = 'Sorry, there was an error sending your message. Please try again.';

      if (error instanceof Error && error.name === 'AbortError') {
        errorContent = 'Request timed out. Please check your internet connection and try again.';
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        errorContent = 'Unable to connect to our servers. Please check your internet connection and try again.';
      } else if (error instanceof Error && error.message.includes('HTTP')) {
        errorContent = 'Our chat service is temporarily unavailable. Please try again in a moment or call us directly.';
      }

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
  }, [inputValue, isSending, conversationId, customerInfo]);

  // Update ref for speech recognition to use
  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      toast({
        title: 'Voice Input Not Supported',
        description: 'Your browser does not support voice input. Please try Chrome or Edge.',
        variant: 'destructive',
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
        toast({
          title: 'Voice Input Error',
          description: 'Failed to start voice recording. Please try again.',
          variant: 'destructive',
        });
      }
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
    <div className="w-full max-w-[500px] mx-auto h-[600px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
      {/* Header with Avatar */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex items-center gap-3 shadow-md">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
          <Bot className="w-7 h-7 text-blue-500" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-lg">Sarah - PlumberPro Tech</div>
          <div className="text-xs text-blue-100 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Online 24/7 - Ready to help
          </div>
        </div>
      </div>

      {/* Customer Info Form */}
      {showCustomerForm && (
        <div className="flex-1 p-6 bg-gradient-to-b from-blue-50 to-white overflow-y-auto">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to PlumberPro!</h3>
              <p className="text-gray-600 text-sm">
                Let's get started with your information so we can assist you better.
              </p>
            </div>

            <form onSubmit={handleCustomerInfoSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="John Doe"
                  className="w-full"
                  maxLength={100}
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  placeholder="(555) 123-4567"
                  className="w-full"
                  maxLength={20}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="john@example.com"
                  className="w-full"
                  maxLength={255}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
              >
                Start Chatting with Sarah
              </Button>
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                By providing your information, you consent to receive service messages.
                We respect your privacy and never share your data.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Messages Area */}
      {!showCustomerForm && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <Bot className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">Send a message to get started!</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2 flex-shrink-0 shadow-sm">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-gray-200 text-gray-900 rounded-tr-sm'
                      : 'bg-blue-50 text-gray-900 rounded-tl-sm border border-blue-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                    {message.content}
                  </p>
                  <span className="text-xs mt-1 block text-gray-500">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t bg-white">
            {isListening && (
              <div className="mb-2 flex items-center justify-center gap-2 text-red-500 text-sm font-medium animate-pulse">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                Listening...
              </div>
            )}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Type your message or use voice..."
                  className="w-full resize-none"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={isSending}
                  maxLength={1000}
                  aria-label="Message input"
                />
              </div>

              {/* Voice Button */}
              <Button
                type="button"
                onClick={toggleVoiceRecording}
                disabled={isSending}
                variant="outline"
                size="icon"
                className={`flex-shrink-0 transition-all ${
                  isRecording
                    ? 'bg-red-50 border-red-300 hover:bg-red-100 animate-pulse'
                    : 'bg-white hover:bg-gray-50'
                }`}
                aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
              >
                {isRecording ? (
                  <MicOff className="w-5 h-5 text-red-500" />
                ) : (
                  <Mic className="w-5 h-5 text-gray-600" />
                )}
              </Button>

              {/* Send Button */}
              <Button
                onClick={handleSendMessage}
                disabled={isSending || !inputValue.trim()}
                size="icon"
                className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                aria-label="Send message"
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <div className="text-xs text-gray-400 mt-2 text-center">
              Powered by PlumberPro AI - Available 24/7
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
