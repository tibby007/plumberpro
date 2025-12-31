import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { sendMessageToN8N } from '@/lib/api';
import type { Message, ContactInfo } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { z } from 'zod';

interface ChatWidgetProps {
  embedded?: boolean;
}

export function ChatWidget({ embedded = false }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const { toast } = useToast();

  const handleContactSubmit = async (info: ContactInfo) => {
    setContactInfo(info);
    const newConversationId = crypto.randomUUID();
    setConversationId(newConversationId);
    
    // Add welcome message
    const welcomeMessage = {
      id: crypto.randomUUID(),
      conversation_id: newConversationId,
      message: "Hi! I'm here to help with your plumbing needs. How can I assist you today?",
      sender: 'ai',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage as Message]);
  };

  const sendMessage = async () => {
    if (!input.trim() || !contactInfo || isLoading) return;

    const userMessage = {
      id: crypto.randomUUID(),
      conversation_id: conversationId,
      message: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage as Message]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessageToN8N(
        userMessage.message,
        contactInfo,
        conversationId
      );

      const aiMessage = {
        id: response.id || crypto.randomUUID(),
        conversation_id: conversationId,
        message: response.message || response.reply || '',
        sender: 'ai',
        timestamp: response.timestamp ? new Date(response.timestamp) : new Date(),
      };

      setMessages((prev) => [...prev, aiMessage as Message]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Embedded mode - always visible, centered widget
  if (embedded) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-background/95 backdrop-blur-sm border-2 border-white/20 rounded-lg shadow-2xl flex flex-col animate-scale-in">
        <div className="p-6 border-b bg-primary text-primary-foreground rounded-t-lg">
          <h3 className="font-semibold text-xl">💬 PlumberPro AI Assistant</h3>
          <p className="text-sm opacity-90">Get instant help with your plumbing needs</p>
        </div>
        
        <div className="flex-1 overflow-hidden min-h-[500px] max-h-[600px]">
          {!contactInfo ? (
            <ContactForm onSubmit={handleContactSubmit} />
          ) : (
            <ChatMessages
              messages={messages}
              input={input}
              setInput={setInput}
              sendMessage={sendMessage}
              isLoading={isLoading}
              handleKeyPress={handleKeyPress}
            />
          )}
        </div>
      </div>
    );
  }

  // Floating mode - legacy (not used in new design)
  return null;
}

interface ContactFormProps {
  onSubmit: (info: ContactInfo) => void;
}

// Validation schema for contact information
const contactSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters"),
  phone: z.string()
    .regex(/^[\d\s()+-]+$/, "Phone number contains invalid characters")
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number is too long"),
  email: z.string()
    .email("Invalid email address")
    .max(255, "Email is too long"),
}).transform((data) => ({
  name: data.name.trim(),
  phone: data.phone.trim(),
  email: data.email.trim(),
}));

function ContactForm({ onSubmit }: ContactFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate using zod schema
    const result = contactSchema.safeParse({ 
      name: name.trim(), 
      phone: phone.trim(), 
      email: email.trim() 
    });
    
    if (!result.success) {
      const firstError = result.error.errors[0];
      toast({
        title: 'Validation Error',
        description: firstError.message,
        variant: 'destructive',
      });
      return;
    }

    onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 animate-fade-in">
      <p className="text-sm text-muted-foreground">
        Welcome! Please provide your contact information to get started.
      </p>
      <div className="space-y-3">
        <Input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          required
        />
        <Input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={20}
          required
        />
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={255}
          required
        />
      </div>
      <Button type="submit" className="w-full">
        Start Chat
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        By providing your phone number and starting the chat, you consent to receive service messages and appointment updates from PlumberPro. Message/data rates may apply. Reply STOP to opt out. See our{" "}
        <a href="https://plumberpro.lovable.app/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          privacy policy
        </a>
      </p>
    </form>
  );
}

interface ChatMessagesProps {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  sendMessage: () => void;
  isLoading: boolean;
  handleKeyPress: (e: React.KeyboardEvent) => void;
}

function ChatMessages({
  messages,
  input,
  setInput,
  sendMessage,
  isLoading,
  handleKeyPress,
}: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        msg.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                      </p>
                    </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="rounded-lg px-4 py-2 bg-muted flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Typing...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t space-y-3">
        <div className="flex gap-2">
          <Textarea
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            className="resize-none"
            rows={2}
            maxLength={1000}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-auto"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          By providing your phone number and starting the chat, you consent to receive service messages and appointment updates from PlumberPro. Message/data rates may apply. Reply STOP to opt out. See our{" "}
          <a href="https://plumberpro.lovable.app/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            privacy policy
          </a>
        </p>
      </div>
    </div>
  );
}
