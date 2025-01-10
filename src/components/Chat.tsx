'use client';

import React,{ useState, useRef, useEffect, FormEvent, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LangflowClient } from '@/utils/langflow-client';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { MessageSquare, Send, PieChart as PieChartIcon, BarChart as BarChartIcon } from 'lucide-react';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  visualization?: Visualization;
}

interface Visualization {
  type: 'bar' | 'pie';
  data: DataPoint[];
}

interface DataPoint {
  name: string;
  value: number;
}

interface ChartAnalysis {
  total: number;
  average: number;
  max: number;
  min: number;
  median: number;
}

// Constants
const CONSTANTS = {
  FLOW_ID: 'ac7a0ad3-a4bf-40f7-8948-15d0ed0ca2ab',
  LANGFLOW_ID: 'cda19269-2679-4644-b89d-dda2715706f7',
  COLORS: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#2563eb', '#1d4ed8'],
  MAX_MESSAGES: 50,
  TYPING_INDICATOR_DELAY: 500,
} as const;

const tweaks = {
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

// Utility functions
const generateMessageId = () => crypto.randomUUID();

const calculateAnalysis = (data: DataPoint[]): ChartAnalysis => {
  const values = data.map(item => item.value);
  const sortedValues = [...values].sort((a, b) => a - b);
  
  return {
    total: values.reduce((sum, val) => sum + val, 0),
    average: values.reduce((sum, val) => sum + val, 0) / values.length,
    max: Math.max(...values),
    min: Math.min(...values),
    median: values.length % 2 === 0 
      ? (sortedValues[values.length / 2 - 1] + sortedValues[values.length / 2]) / 2
      : sortedValues[Math.floor(values.length / 2)]
  };
};

// Components
const ChartContainer = ({ data, type, height = 400 }: { data: DataPoint[]; type: 'bar' | 'pie'; height?: number }) => {
  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="value" 
            fill="#3b82f6"
            animationDuration={1000}
            animationBegin={0}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={true}
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          outerRadius={height / 3}
          fill="#8884d4"
          dataKey="value"
          animationDuration={1000}
          animationBegin={0}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={CONSTANTS.COLORS[index % CONSTANTS.COLORS.length]} 
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

const DataVisualizationPanel = ({ data, type }: { data: DataPoint[]; type: 'bar' | 'pie' }) => {
  const analysis = calculateAnalysis(data);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
      <Tabs defaultValue="bar" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="bar" className="flex items-center gap-2">
            <BarChartIcon className="w-4 h-4" />
            Bar
          </TabsTrigger>
          <TabsTrigger value="pie" className="flex items-center gap-2">
            <PieChartIcon className="w-4 h-4" />
            Pie
          </TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="bar" className="h-[400px]">
          <ChartContainer data={data} type="bar" />
        </TabsContent>

        <TabsContent value="pie" className="h-[400px]">
          <ChartContainer data={data} type="pie" />
        </TabsContent>

        <TabsContent value="analysis">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-blue-600">{analysis.total.toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Average</p>
              <p className="text-2xl font-bold text-blue-600">{analysis.average.toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Median</p>
              <p className="text-2xl font-bold text-blue-600">{analysis.median.toFixed(2)}</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default function Chat(): React.ReactElement {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const client = useRef(new LangflowClient());
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const detectAndParseData = useCallback((content: string): Visualization | null => {
    const lines = content.split('\n');
    const data: DataPoint[] = [];
    
    for (const line of lines) {
      const match = line.match(/([^:]+):\s*(\d+\.?\d*)/);
      if (match) {
        data.push({
          name: match[1].trim(),
          value: parseFloat(match[2])
        });
      }
    }
    
    if (data.length > 0) {
      return {
        type: data.length <= 4 ? 'pie' : 'bar',
        data
      };
    }
    
    return null;
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setError('');
    
    // Create new message objects with IDs and timestamps
    const newUserMessage: Message = {
      id: generateMessageId(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    };

    setMessages(prev => {
      const updatedMessages = [...prev, newUserMessage];
      // Keep only the last MAX_MESSAGES
      return updatedMessages.slice(-CONSTANTS.MAX_MESSAGES);
    });

    setIsLoading(true);

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await client.current.runFlow(
        CONSTANTS.FLOW_ID,
        CONSTANTS.LANGFLOW_ID,
        userMessage,
        'chat',
        'chat',
        tweaks,
        false,
        (data) => console.log("Received:", data.chunk),
        (message) => console.log("Stream Closed:", message),
        (error) => {
          console.error("Stream Error:", error);
          setError('Error processing stream data');
        }
      );

      if (response?.outputs?.[0]?.outputs?.[0]?.outputs?.message?.message?.text) {
        const assistantMessageContent = response.outputs[0].outputs[0].outputs.message.message.text;
        const visualization = detectAndParseData(assistantMessageContent);
        
        const newAssistantMessage: Message = {
          id: generateMessageId(),
          role: 'assistant',
          content: assistantMessageContent,
          timestamp: Date.now(),
          visualization: visualization || undefined
        };

        setMessages(prev => {
          const updatedMessages = [...prev, newAssistantMessage];
          return updatedMessages.slice(-CONSTANTS.MAX_MESSAGES);
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request aborted');
        return;
      }

      console.error('Error:', error);
      setError(error.response?.data?.error || error.message || 'An error occurred while processing your request');
      
      const errorMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto h-[800px] flex flex-col bg-gray-50">
      <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-start max-w-[90%]">
                <div
                  className={`
                    p-4 rounded-2xl shadow-sm
                    ${message.role === 'user' ? 
                      'bg-blue-500 text-white rounded-br-none' : 
                      'bg-gray-100 text-gray-900 rounded-bl-none'
                    }
                  `}
                >
                  <div className="flex items-start gap-2">
                    {message.role === 'assistant' && <MessageSquare className="w-5 h-5 mt-1" />}
                    <div className="space-y-2">
                      <div className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </div>
                      {message.visualization && (
                        <DataVisualizationPanel
                          type={message.visualization.type}
                          data={message.visualization.data}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-4 rounded-2xl rounded-bl-none shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="animate-pulse flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <CardContent className="p-4 border-t bg-white">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Sending</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                <span>Send</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}