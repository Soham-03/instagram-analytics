import axios from 'axios';

export class LangflowClient {
    constructor() {
        this.api = axios.create({
            baseURL: '/api/langflow',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Add response interceptor for error handling
        this.api.interceptors.response.use(
            response => response,
            error => {
                console.error('API Error:', error.response?.data || error.message);
                throw error;
            }
        );
    }

    async runFlow(flowId, langflowId, inputValue, inputType = 'chat', outputType = 'chat', tweaks = {}, stream = false, onUpdate, onClose, onError) {
        try {
            const response = await this.api.post('', {
                flowId,
                langflowId,
                inputValue,
                inputType,
                outputType,
                tweaks,
                stream
            });
            
            if (stream && response.data?.outputs?.[0]?.outputs?.[0]?.artifacts?.stream_url) {
                const streamUrl = response.data.outputs[0].outputs[0].artifacts.stream_url;
                this.handleStream(streamUrl, onUpdate, onClose, onError);
            }
            return response.data;
        } catch (error) {
            console.error('Error running flow:', error);
            onError?.('Error initiating session');
            throw error;
        }
    }

    handleStream(streamUrl, onUpdate, onClose, onError) {
        const eventSource = new EventSource(streamUrl);

        eventSource.onmessage = event => {
            try {
                const data = JSON.parse(event.data);
                onUpdate(data);
            } catch (error) {
                console.error('Error parsing stream data:', error);
                onError(error);
            }
        };

        eventSource.onerror = event => {
            console.error('Stream Error:', event);
            onError(event);
            eventSource.close();
        };

        eventSource.addEventListener("close", () => {
            onClose('Stream closed');
            eventSource.close();
        });

        return eventSource;
    }
}