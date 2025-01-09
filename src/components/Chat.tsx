'use client';
import { useState, useRef, useEffect, FormEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LangflowClient } from '@/utils/langflow-client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Tweaks {
  [key: string]: Record<string, unknown>;
}

const FLOW_ID = 'ac7a0ad3-a4bf-40f7-8948-15d0ed0ca2ab';
const LANGFLOW_ID = 'cda19269-2679-4644-b89d-dda2715706f7';

const tweaks: Tweaks = {
  "File-Jg8DN": {},
  "SplitText-tlOKg": {},
  "MistalAIEmbeddings-EMDb4": {},
  "AstraDB-Vu9Ig": {},
  "ParseData-NpdeV": {},
  "ChatInput-EYJs4": {},
  "AstraDB-jZZ4V": {},
  "MistalAIEmbeddings-FZTc7": {},
  "ParseData-Oj3Jm": {},
  "Prompt-0BEpF": {},
  "GroqModel-f57h8": {},
  "ChatOutput-OP0yB": {}
};

export default function Chat(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const client = new LangflowClient();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setError('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await client.runFlow(
        FLOW_ID,
        LANGFLOW_ID,
        userMessage,
        'chat',
        'chat',
        tweaks,
        false,
        (data: { chunk: unknown }) => console.log("Received:", data.chunk),
        (message: string) => console.log("Stream Closed:", message),
        (error: unknown) => {
          console.error("Stream Error:", error);
          setError('Error processing stream data');
        }
      );

      if (response?.outputs?.[0]?.outputs?.[0]?.outputs?.message?.message?.text) {
        const assistantMessage = response.outputs[0].outputs[0].outputs.message.message.text;
        setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An error occurred while processing your request';
        
      setError((error as any)?.response?.data?.error || errorMessage);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-full mx-auto h-[640px] flex flex-col">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg">
                Thinking...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <CardContent className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}