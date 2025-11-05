# Widget UI Patterns Skill

## Widget Architecture Overview

The PlumberPro widget is an embeddable chat interface that customers interact with on plumbing company websites. It supports three modes: text chat, voice call, and direct phone call.

## Component Patterns

### Three-Mode Widget Pattern

The widget has four distinct states:

1. **Closed State** - Floating action button (FAB)
2. **Choice State** - Mode selector showing three options
3. **Text State** - Chat interface for messaging
4. **Voice State** - Voice conversation interface

```typescript
type WidgetMode = 'closed' | 'choice' | 'text' | 'voice';
type WidgetState = {
  mode: WidgetMode;
  isConnected: boolean;
  hasUnreadMessages: boolean;
  messageCount: number;
};

const [widgetState, setWidgetState] = useState<WidgetState>({
  mode: 'closed',
  isConnected: false,
  hasUnreadMessages: false,
  messageCount: 0
});
```

### 1. Closed State (FAB)

**Visual Pattern:**
```tsx
<button
  className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110"
  onClick={() => setMode('choice')}
  aria-label="Open chat"
>
  <MessageCircle className="w-8 h-8" />
  {hasUnreadMessages && (
    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center animate-pulse">
      {messageCount}
    </span>
  )}
</button>
```

**Features:**
- Always visible (fixed position)
- Pulse animation on new messages
- Badge shows unread count
- Smooth hover effect
- High z-index (z-50 or higher)

### 2. Choice State (Mode Selector)

**Visual Pattern:**
```tsx
<div className="fixed bottom-24 right-6 bg-white rounded-2xl shadow-2xl p-6 w-80 animate-slide-up">
  <h3 className="text-lg font-semibold mb-4">How can we help you?</h3>

  <button className="w-full p-4 mb-3 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
    <MessageSquare className="inline mr-3 text-blue-600" />
    <div>
      <div className="font-medium">Chat with us</div>
      <div className="text-sm text-gray-500">Get instant answers</div>
    </div>
  </button>

  <button className="w-full p-4 mb-3 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
    <Phone className="inline mr-3 text-blue-600" />
    <div>
      <div className="font-medium">Talk to AI assistant</div>
      <div className="text-sm text-gray-500">Speak naturally</div>
    </div>
  </button>

  <button className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
    <PhoneCall className="inline mr-3 text-blue-600" />
    <div>
      <div className="font-medium">Call us directly</div>
      <div className="text-sm text-gray-500">(555) 123-4567</div>
    </div>
  </button>
</div>
```

**Features:**
- Clear visual hierarchy
- Icon + title + description for each option
- Hover states to indicate interactivity
- Slide-up animation on open

### 3. Text State (Chat Interface)

**Visual Pattern:**
```tsx
<div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col animate-slide-up">
  {/* Header */}
  <div className="bg-blue-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
        <MessageCircle className="w-6 h-6" />
      </div>
      <div>
        <div className="font-semibold">PlumberPro Support</div>
        <div className="text-xs text-white/80">Usually replies instantly</div>
      </div>
    </div>
    <button onClick={() => setMode('closed')} className="hover:bg-white/10 p-2 rounded">
      <X className="w-5 h-5" />
    </button>
  </div>

  {/* Messages */}
  <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesEndRef}>
    {messages.map((msg) => (
      <Message key={msg.id} message={msg} />
    ))}
    {isTyping && <TypingIndicator />}
  </div>

  {/* Input */}
  <div className="p-4 border-t">
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Type your message..."
        className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        disabled={isSending}
      />
      <button
        onClick={handleSend}
        disabled={isSending || !inputValue.trim()}
        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
    <div className="text-xs text-gray-400 mt-2 text-center">
      Powered by PlumberPro AI
    </div>
  </div>
</div>
```

### 4. Voice State (Voice Interface)

**Visual Pattern:**
```tsx
<div className="fixed bottom-6 right-6 w-96 h-96 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl shadow-2xl flex flex-col items-center justify-center p-8">
  <div className="relative mb-6">
    <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
      <Mic className={`w-16 h-16 ${isListening ? 'animate-pulse' : ''}`} />
    </div>
    {isListening && (
      <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
    )}
  </div>

  <div className="text-2xl font-semibold mb-2">
    {isConnecting ? 'Connecting...' : isListening ? 'Listening...' : 'Voice Chat'}
  </div>

  <div className="text-white/80 text-center mb-6">
    {isListening ? 'Speak naturally, we\'re listening' : 'Tap microphone to start'}
  </div>

  <div className="flex gap-4">
    <button
      onClick={handleToggleMute}
      className="w-14 h-14 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
    >
      {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
    </button>
    <button
      onClick={handleEndCall}
      className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all"
    >
      <PhoneOff className="w-6 h-6" />
    </button>
  </div>

  <button
    onClick={() => setMode('choice')}
    className="mt-6 text-white/60 hover:text-white text-sm"
  >
    Back to options
  </button>
</div>
```

## Message Display Patterns

### User Message
```tsx
<div className="flex justify-end">
  <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
    <p className="text-sm">{message.content}</p>
    <span className="text-xs text-white/70 mt-1 block">
      {formatTime(message.timestamp)}
    </span>
  </div>
</div>
```

### AI Message
```tsx
<div className="flex justify-start">
  <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%]">
    <p className="text-sm">{message.content}</p>
    <span className="text-xs text-gray-500 mt-1 block">
      {formatTime(message.timestamp)}
    </span>
  </div>
</div>
```

### System Message (e.g., "Lead created successfully")
```tsx
<div className="flex justify-center">
  <div className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full border border-green-200">
    <CheckCircle className="inline w-3 h-3 mr-1" />
    {message.content}
  </div>
</div>
```

### Typing Indicator
```tsx
<div className="flex justify-start">
  <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
    <div className="flex gap-1">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
</div>
```

## State Management Patterns

### React State Pattern
```typescript
interface WidgetState {
  mode: 'closed' | 'choice' | 'text' | 'voice';
  messages: Message[];
  isTyping: boolean;
  isSending: boolean;
  isConnected: boolean;
  conversationId: string | null;
  error: string | null;
}

const [state, setState] = useState<WidgetState>({
  mode: 'closed',
  messages: [],
  isTyping: false,
  isSending: false,
  isConnected: false,
  conversationId: null,
  error: null
});

// Helper functions
const addMessage = (content: string, role: 'user' | 'assistant') => {
  setState(prev => ({
    ...prev,
    messages: [
      ...prev.messages,
      {
        id: generateId(),
        content,
        role,
        timestamp: new Date().toISOString()
      }
    ]
  }));
};

const setTyping = (isTyping: boolean) => {
  setState(prev => ({ ...prev, isTyping }));
};
```

### Zustand Store Pattern (Alternative)
```typescript
import { create } from 'zustand';

interface WidgetStore {
  mode: WidgetMode;
  messages: Message[];
  isTyping: boolean;

  // Actions
  setMode: (mode: WidgetMode) => void;
  addMessage: (message: Message) => void;
  setTyping: (isTyping: boolean) => void;
  clearMessages: () => void;
}

const useWidgetStore = create<WidgetStore>((set) => ({
  mode: 'closed',
  messages: [],
  isTyping: false,

  setMode: (mode) => set({ mode }),
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  setTyping: (isTyping) => set({ isTyping }),
  clearMessages: () => set({ messages: [] })
}));
```

## Loading States

### Initial Connection
```tsx
<div className="flex flex-col items-center justify-center p-8">
  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
  <p className="text-sm text-gray-600">Connecting to support...</p>
</div>
```

### Sending Message
```tsx
{isSending && (
  <div className="absolute top-2 right-2">
    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
  </div>
)}
```

### Voice Connecting
```tsx
<div className="text-center">
  <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
  <p className="text-white text-lg">Connecting to voice assistant...</p>
  <p className="text-white/60 text-sm mt-2">This may take a moment</p>
</div>
```

## Error Handling Patterns

### Network Error
```tsx
<div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
  <div className="flex items-start gap-3">
    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <p className="text-sm font-medium text-red-900">Connection lost</p>
      <p className="text-xs text-red-700 mt-1">
        We're having trouble reaching our servers. Trying to reconnect...
      </p>
    </div>
  </div>
</div>
```

### Microphone Permission Denied
```tsx
<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 m-4">
  <div className="flex items-start gap-3">
    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <p className="text-sm font-medium text-yellow-900">Microphone access needed</p>
      <p className="text-xs text-yellow-700 mt-1">
        Please allow microphone access to use voice chat
      </p>
      <button
        onClick={() => setMode('text')}
        className="text-xs text-yellow-800 underline mt-2"
      >
        Switch to text chat instead
      </button>
    </div>
  </div>
</div>
```

### API Error
```tsx
<div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
  <div className="flex items-start gap-3">
    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <p className="text-sm font-medium text-red-900">Something went wrong</p>
      <p className="text-xs text-red-700 mt-1">
        We couldn't send your message. Please try again.
      </p>
      <button
        onClick={handleRetry}
        className="mt-2 text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
      >
        Retry
      </button>
    </div>
  </div>
</div>
```

## Responsive Design Patterns

### Mobile (<768px)

```tsx
// Full-screen overlay on mobile
<div className={`
  fixed inset-0 z-50 bg-white
  md:bottom-6 md:right-6 md:w-96 md:h-[600px] md:rounded-2xl
  ${mode === 'closed' ? 'hidden' : 'flex flex-col'}
`}>
  {/* Widget content */}
</div>
```

**Mobile-Specific Features:**
- Full-screen takeover (no floating panel)
- Larger touch targets (min 44x44px)
- Bottom sheet style with drag-to-close
- Virtual keyboard handling (adjust viewport)
- Disable body scroll when open

```css
/* Prevent background scroll on mobile */
.widget-open {
  overflow: hidden;
  position: fixed;
  width: 100%;
}
```

### Tablet (768px - 1024px)

```tsx
<div className={`
  fixed bottom-6 right-6 z-50
  w-full md:w-96
  h-full md:h-[600px]
  md:rounded-2xl
  shadow-2xl
`}>
  {/* Widget content */}
</div>
```

### Desktop (>1024px)

```tsx
<div className="fixed bottom-6 right-6 w-96 h-[600px] rounded-2xl shadow-2xl z-50">
  {/* Widget content */}
</div>
```

**Desktop-Specific Features:**
- Fixed dimensions (400px x 600px)
- Drop shadow for depth
- Hover states more prominent
- Keyboard navigation support

## Accessibility Patterns

### Keyboard Navigation

```tsx
// Trap focus within widget when open
useEffect(() => {
  if (mode !== 'closed') {
    const widget = widgetRef.current;
    const focusableElements = widget?.querySelectorAll(
      'button, input, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements && focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }
}, [mode]);

// Handle Escape key to close
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && mode !== 'closed') {
      setMode('closed');
    }
  };

  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [mode]);
```

### ARIA Labels

```tsx
<button
  aria-label="Open chat widget"
  aria-expanded={mode !== 'closed'}
  aria-controls="widget-content"
>
  <MessageCircle aria-hidden="true" />
</button>

<div
  id="widget-content"
  role="dialog"
  aria-labelledby="widget-title"
  aria-modal="true"
  hidden={mode === 'closed'}
>
  <h2 id="widget-title" className="sr-only">
    Customer support chat
  </h2>
  {/* Widget content */}
</div>
```

### Screen Reader Announcements

```tsx
import { useAnnouncer } from '@/hooks/useAnnouncer';

const announcer = useAnnouncer();

// Announce new messages
useEffect(() => {
  if (messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'assistant') {
      announcer.announce(lastMessage.content);
    }
  }
}, [messages]);

// Announcer implementation
function useAnnouncer() {
  const announce = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  return { announce };
}
```

### Focus Management

```tsx
// Return focus to trigger when closing
const triggerRef = useRef<HTMLButtonElement>(null);

const handleClose = () => {
  setMode('closed');
  triggerRef.current?.focus();
};
```

## Animation Patterns

### Slide Up Animation
```css
@keyframes slideUp {
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
  animation: slideUp 0.3s ease-out;
}
```

### Fade In
```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
```

### Pulse (for unread indicator)
```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

## Performance Optimization Patterns

### Virtualized Message List (for long conversations)
```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

const MessageList = ({ messages }: { messages: Message[] }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5
  });

  return (
    <div ref={parentRef} className="flex-1 overflow-y-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            <Message message={messages[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Debounced Input
```tsx
import { useDebouncedCallback } from 'use-debounce';

const handleTyping = useDebouncedCallback(() => {
  // Send typing indicator to server
  socket.emit('typing', { conversationId });
}, 500);
```

### Lazy Load Widget Bundle
```tsx
// Only load widget code when user opens it
const ChatWidget = lazy(() => import('./ChatWidget'));

<Suspense fallback={<div>Loading...</div>}>
  {mode !== 'closed' && <ChatWidget />}
</Suspense>
```

## Customization Patterns

### Theme Support
```typescript
interface WidgetTheme {
  primaryColor: string;
  textColor: string;
  backgroundColor: string;
  borderRadius: string;
  fontFamily: string;
}

const defaultTheme: WidgetTheme = {
  primaryColor: '#3B82F6',
  textColor: '#1F2937',
  backgroundColor: '#FFFFFF',
  borderRadius: '1rem',
  fontFamily: 'system-ui, -apple-system, sans-serif'
};

// Apply theme
<div style={{
  '--widget-primary': theme.primaryColor,
  '--widget-text': theme.textColor,
  '--widget-bg': theme.backgroundColor,
  '--widget-radius': theme.borderRadius,
  '--widget-font': theme.fontFamily
} as React.CSSProperties}>
  {/* Widget content */}
</div>
```

### Position Options
```typescript
type WidgetPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

const positionClasses: Record<WidgetPosition, string> = {
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
  'top-right': 'top-6 right-6',
  'top-left': 'top-6 left-6'
};

<div className={`fixed ${positionClasses[position]} z-50`}>
  {/* Widget */}
</div>
```

## Auto-scroll Pattern

```tsx
const messagesEndRef = useRef<HTMLDivElement>(null);

// Auto-scroll to bottom on new messages
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);

// In JSX
<div className="messages-container">
  {messages.map(msg => <Message key={msg.id} message={msg} />)}
  <div ref={messagesEndRef} />
</div>
```

## Best Practices

### 1. Progressive Enhancement
- Widget should work without JavaScript (show phone number fallback)
- Gracefully handle API failures
- Offline detection and messaging

### 2. Privacy & Security
- Don't log sensitive data (addresses, phone numbers)
- Use HTTPS for all API calls
- Clear conversation on close (or after timeout)

### 3. Performance
- Lazy load widget bundle (don't load until needed)
- Virtualize long message lists
- Debounce typing indicators
- Optimize re-renders with React.memo

### 4. UX Polish
- Auto-focus input when opening text chat
- Show "typing..." when AI is responding
- Smooth animations (but not too slow)
- Clear loading and error states
- Persist conversation across page navigation (use localStorage)

### 5. Testing
- Test on actual mobile devices (not just Chrome DevTools)
- Test with screen readers (VoiceOver, NVDA)
- Test keyboard-only navigation
- Test slow network conditions
- Test with ad blockers enabled
