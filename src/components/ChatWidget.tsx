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

export function ChatWidget() {
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
    const welcomeMessage: Message = {
      id: crypto.randomUUID(),
      conversation_id: newConversationId,
      message: "Hi! I'm here to help with your plumbing needs. How can I assist you today?",
      sender: 'ai',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const sendMessage = async () => {
    if (!input.trim() || !contactInfo || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      conversation_id: conversationId,
      message: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessageToN8N(
        userMessage.message,
        contactInfo,
        conversationId
      );

      const aiMessage: Message = {
        id: response.id || crypto.randomUUID(),
        conversation_id: conversationId,
        message: response.message || response.reply,
        sender: 'ai',
        timestamp: response.timestamp ? new Date(response.timestamp) : new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
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

  return (
    <>
      {/* Floating chat button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 md:bottom-6 right-4 md:right-6 h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg z-50 animate-fade-in"
        size="icon"
      >
        {isOpen ? <X className="h-5 w-5 md:h-6 md:w-6" /> : <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />}
      </Button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-24 right-4 md:right-6 w-[calc(100vw-2rem)] sm:w-96 h-[500px] max-h-[80vh] bg-background border rounded-lg shadow-xl flex flex-col z-50 animate-scale-in">
          <div className="p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
            <h3 className="font-semibold text-base md:text-lg">PlumberPro AI Assistant</h3>
            <p className="text-xs opacity-90">We typically reply instantly</p>
          </div>
          
          <div className="flex-1 overflow-hidden">
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
      )}
    </>
  );
}

interface ContactFormProps {
  onSubmit: (info: ContactInfo) => void;
}

function ContactForm({ onSubmit }: ContactFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !phone.trim() || !email.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    onSubmit({ name: name.trim(), phone: phone.trim(), email: email.trim() });
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
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatDistanceToNow(message.timestamp, { addSuffix: true })}
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

      <div className="p-4 border-t">
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
      </div>
    </div>
  );
}
