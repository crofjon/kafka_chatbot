
export interface KafkaMetric {
  timestamp: string;
  connections: number;
  requestRate: number;
  bytesIn: number;
  bytesOut: number;
}

export interface ClusterInfo {
  id: string;
  name: string;
  region: string;
  provider: string;
  status: 'UP' | 'DOWN' | 'DEGRADED';
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
