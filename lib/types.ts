export interface DocumentInput {
  name: string;
  content: string;
}

export interface AnalyzeRequest {
  documents: DocumentInput[];
  useCached: boolean;
}

export interface FlagSource {
  doc: string;
  quote: string;
}

export interface Flag {
  id: string;
  severity: 'high' | 'medium' | 'low';
  category: 'legal' | 'financial' | 'reputation' | 'ownership';
  title: string;
  explanation: string;
  source: FlagSource;
  quoteVerified: boolean;
}

export interface Contradiction {
  title: string;
  explanation: string;
  sources: Array<{ doc: string; quote: string }>;
}

export interface AnalysisResult {
  score: number;
  subscores: {
    legal: number;
    financial: number;
    reputation: number;
    ownership: number;
  };
  verdict: 'go' | 'conditional' | 'no-go';
  flags: Flag[];
  contradictions: Contradiction[];
  questions: string[];
  summary: string;
}

export interface SSEEvent {
  type: 'step' | 'result' | 'error';
  data: string | AnalysisResult;
}

export interface OpenRouterModel {
  id: string;
  name: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
}
