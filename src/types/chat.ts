export interface DataPoint {
    name: string;
    value: number;
  }
  
  export interface Visualization {
    type: 'bar' | 'pie';
    data: DataPoint[];
  }
  
  export interface Message {
    role: 'user' | 'assistant';
    content: string;
    visualization?: Visualization;
  }
  
  export interface Tweaks {
    [key: string]: Record<string, unknown>;
  }
  
  export interface ChartContainerProps {
    data: DataPoint[];
    type: 'bar' | 'pie';
    height?: number;
  }
  
  export interface DataVisualizationPanelProps {
    data: DataPoint[];
    type: 'bar' | 'pie';
  }
  
  export interface Analysis {
    total: number;
    average: number;
    max: number;
    min: number;
  }