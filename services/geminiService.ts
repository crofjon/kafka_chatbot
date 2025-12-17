
// Use correct import for GoogleGenAI
import { GoogleGenAI } from "@google/genai";
import { KafkaMetric } from "../types";

export const analyzeMetrics = async (metrics: KafkaMetric[]) => {
  // Always initialize with named parameter and use process.env.API_KEY directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const metricContext = metrics.map(m => 
    `Time: ${m.timestamp}, Connections: ${m.connections}, ReqRate: ${m.requestRate}`
  ).join('\n');

  const prompt = `
    Analyze the following Kafka connection metrics and provide a brief technical summary. 
    Look for patterns, potential bottlenecks, or anomalies in the active connection count.
    
    Metrics:
    ${metricContext}
    
    Provide your response in Markdown format. Keep it concise and professional.
  `;

  try {
    // Correct usage of generateContent with model and contents
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are an expert Kafka SRE analyst specialized in Confluent Cloud infrastructure. You provide deep technical insights into connection patterns and cluster health."
      }
    });

    // Directly access text property from response
    return response.text || "I was unable to analyze the data at this time.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Failed to fetch AI analysis. Check your API configuration.";
  }
};

export const chatWithAssistant = async (history: { role: string, content: string }[], currentMetrics: KafkaMetric[]) => {
  // Always initialize with named parameter and use process.env.API_KEY directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const metricSnapshot = JSON.stringify(currentMetrics[currentMetrics.length - 1]);
  
  const prompt = `
    User question: ${history[history.length - 1].content}
    Latest Metric Snapshot: ${metricSnapshot}
    
    Respond based on the context of these Kafka metrics.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are an assistant for a Kafka monitoring dashboard. Help the user understand their cluster's active connection count and related performance metrics."
      }
    });

    // Directly access text property from response
    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Error communicating with AI assistant.";
  }
};
