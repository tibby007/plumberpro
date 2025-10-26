import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasContactInfo, setHasContactInfo] = useState(false);

  return (
    <>
      {/* Floating chat button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-background border rounded-lg shadow-xl flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold">PlumberPro AI Assistant</h3>
          </div>
          
          <div className="flex-1 p-4">
            {!hasContactInfo ? (
              <ContactForm onSubmit={() => setHasContactInfo(true)} />
            ) : (
              <ChatMessages />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ContactForm({ onSubmit }: { onSubmit: () => void }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      <p className="text-sm text-muted-foreground">Please provide your contact information to get started.</p>
      <Input placeholder="Your name" required />
      <Input type="tel" placeholder="Phone number" required />
      <Input type="email" placeholder="Email address" required />
      <Button type="submit" className="w-full">Start Chat</Button>
    </form>
  );
}

function ChatMessages() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto mb-4">
        <p className="text-sm text-muted-foreground">Chat messages will appear here...</p>
      </div>
      <div className="flex gap-2">
        <Textarea placeholder="Type your message..." className="resize-none" rows={2} />
        <Button>Send</Button>
      </div>
    </div>
  );
}
