import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosInstance } from 'axios';

const LANGFLOW_BASE_URL = 'https://api.langflow.astra.datastax.com';
const APPLICATION_TOKEN = 'AstraCS:mCLZZzxiUSgKAPHFDEFZBWnI:58e6a1b2cfb99157dae4a36d9ce0791caf4e91b5d96ef7b5d9d3f2787e2dea6a';

interface LangflowRequest {
  flowId: string;
  langflowId: string;
  inputValue: string;
  inputType: string;
  outputType: string;
  tweaks: Record<string, unknown>;
  stream: boolean;
}

interface LangflowResponse {
  outputs: Array<{
    outputs: Array<{
      outputs: {
        message: {
          message: {
            text: string;
          };
        };
      };
      artifacts?: {
        stream_url?: string;
      };
    }>;
  }>;
}

// Create a typed axios instance
const api: AxiosInstance = axios.create({
  baseURL: LANGFLOW_BASE_URL,
  headers: {
    'Authorization': `Bearer ${APPLICATION_TOKEN}`,
    'Content-Type': 'application/json',
  }
});

export async function POST(request: NextRequest) {
  try {
    const body: LangflowRequest = await request.json();
    const { flowId, langflowId, inputValue, inputType, outputType, tweaks, stream } = body;

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
      console.error('API Error:', error.response?.data || error.message);
      return NextResponse.json(
        { 
          error: 'Failed to process request',
          details: error.response?.data || error.message 
        },
        { status: error.response?.status || 500 }
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