import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosInstance, AxiosError } from 'axios';

// Environment variables should be properly typed
interface Env {
  LANGFLOW_BASE_URL: string;
  LANGFLOW_API_TOKEN: string;
}

// Ensure environment variables are available
const env = {
  LANGFLOW_BASE_URL: process.env.LANGFLOW_BASE_URL || 'https://api.langflow.astra.datastax.com',
  LANGFLOW_API_TOKEN: process.env.LANGFLOW_API_TOKEN
};

// Validate environment variables
if (!env.LANGFLOW_API_TOKEN) {
  throw new Error('LANGFLOW_API_TOKEN environment variable is required');
}

interface LangflowRequest {
  flowId: string;
  langflowId: string;
  inputValue: string;
  inputType: string;
  outputType: string;
  tweaks: Record<string, unknown>;
  stream: boolean;
}

interface LangflowMessage {
  text: string;
}

interface LangflowOutput {
  outputs: {
    message: {
      message: LangflowMessage;
    };
  };
  artifacts?: {
    stream_url?: string;
  };
}

interface LangflowResponse {
  outputs: Array<{
    outputs: LangflowOutput[];
  }>;
}

// Create a typed axios instance
const api: AxiosInstance = axios.create({
  baseURL: env.LANGFLOW_BASE_URL,
  headers: {
    'Authorization': `Bearer ${env.LANGFLOW_API_TOKEN}`,
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as LangflowRequest;
    const { flowId, langflowId, inputValue, inputType, outputType, tweaks, stream } = body;

    // Validate required fields
    if (!flowId || !langflowId || !inputValue) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const endpoint = `/lf/${langflowId}/api/v1/run/${flowId}?stream=${stream}`;
    
    const response = await api.post<LangflowResponse>(endpoint, {
      input_value: inputValue,
      input_type: inputType,
      output_type: outputType,
      tweaks: tweaks
    });

    return NextResponse.json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error('API Error:', axiosError.response?.data || axiosError.message);
      
      // Handle specific error cases
      if (axiosError.code === 'ECONNREFUSED') {
        return NextResponse.json(
          { error: 'Unable to connect to Langflow API' },
          { status: 503 }
        );
      }

      if (axiosError.response?.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API token' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { 
          error: 'Failed to process request',
          details: axiosError.response?.data || axiosError.message 
        },
        { status: axiosError.response?.status || 500 }
      );
    }

    // Handle non-Axios errors
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}