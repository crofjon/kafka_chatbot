
import React, { useState, useEffect, useCallback } from 'react';
import { KafkaMetric, ClusterInfo } from './types';
import { analyzeMetrics } from './services/geminiService';
import MetricCard from './components/MetricCard';
import ConnectionChart from './components/ConnectionChart';
import AIAssistant from './components/AIAssistant';

const App: React.FC = () => {
  // Added missing metrics state
  const [metrics, setMetrics] = useState<KafkaMetric[]>([]);
  const [clusterInfo] = useState<ClusterInfo>({
    id: 'lkc-p8y3q7',
    name: 'Production-Primary',
    region: 'us-east-1',
    provider: 'AWS',
    status: 'UP'
  });
  const [aiSummary, setAiSummary] = useState<string>('Analyzing connection patterns...');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Simulated live data generator
  const generateNewMetric = useCallback((lastMetric?: KafkaMetric): KafkaMetric => {
    const now = new Date();
    const timestamp = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    const baseConn = lastMetric ? lastMetric.connections : 840;
    // Simulate some jitter and trends
    const change = Math.floor(Math.random() * 20) - 8;
    return {
      timestamp: `${now.toLocaleDateString()} ${timestamp}`,
      connections: Math.max(0, baseConn + change),
      requestRate: 1500 + Math.floor(Math.random() * 500),
      bytesIn: 25.4 + (Math.random() * 5),
      bytesOut: 18.2 + (Math.random() * 4)
    };
  }, []);

  // Initialize data
  useEffect(() => {
    const initialMetrics: KafkaMetric[] = [];
    let last = generateNewMetric();
    for (let i = 0; i < 20; i++) {
      last = generateNewMetric(last);
      initialMetrics.push(last);
    }
    setMetrics(initialMetrics);

    const interval = setInterval(() => {
      setMetrics(prev => {
        const lastItem = prev[prev.length - 1];
        const next = generateNewMetric(lastItem);
        const updated = [...prev.slice(1), next];
        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [generateNewMetric]);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeMetrics(metrics);
    setAiSummary(result);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    if (metrics.length > 0) {
      runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = metrics[metrics.length - 1] || { connections: 0, requestRate: 0, bytesIn: 0, bytesOut: 0 };
  const previous = metrics[metrics.length - 2] || current;
  const connTrend = ((current.connections - previous.connections) / (previous.connections || 1)) * 100;

  return (
    <div className="min-h-screen pb-12">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">KafkaPulse</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                {clusterInfo.status}
              </div>
              <div className="text-slate-400">|</div>
              <div className="text-sm text-slate-500 font-medium">{clusterInfo.name} ({clusterInfo.id})</div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Metric Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard 
            title="Active Connections" 
            value={current.connections} 
            trend={parseFloat(connTrend.toFixed(1))}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
          />
          <MetricCard 
            title="Request Rate" 
            value={current.requestRate} 
            unit="req/s"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          />
          <MetricCard 
            title="Bytes In" 
            value={current.bytesIn.toFixed(1)} 
            unit="MB/s"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>}
          />
          <MetricCard 
            title="Bytes Out" 
            value={current.bytesOut.toFixed(1)} 
            unit="MB/s"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 space-y-8">
            <ConnectionChart data={metrics} />
            
            {/* AI Insights Panel */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">AI Cluster Analysis</h3>
                </div>
                <button 
                  onClick={runAnalysis}
                  disabled={isAnalyzing}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
                </button>
              </div>
              <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                {aiSummary}
              </div>
            </div>
          </div>

          {/* AI Side Chat */}
          <div className="lg:col-span-1">
            <AIAssistant currentMetrics={metrics} />
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 text-center text-slate-400 text-xs">
        KafkaPulse Connection Monitor • Powered by Gemini AI • Confluent Cloud API Integration
      </footer>
    </div>
  );
};

export default App;
