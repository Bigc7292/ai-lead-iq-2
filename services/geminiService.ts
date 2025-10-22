import { GoogleGenAI } from "@google/genai";
import { Lead } from '../types';

export const ai = process.env.API_KEY
  ? new GoogleGenAI({ apiKey: process.env.API_KEY })
  : null;

if (!ai) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}


export const getLeadInsight = async (lead: Lead): Promise<string> => {
  if (!ai) {
    return Promise.resolve("AI functionality is disabled. Please configure your API key.");
  }
  
  try {
    const prompt = `
      Analyze the following sales lead and provide actionable insights. 
      Focus on potential conversation starters, key selling points based on their company, position, and industry, and potential risks.
      Keep the analysis concise and bullet-pointed.

      Lead Information:
      - Name: ${lead.name}
      - Company: ${lead.company}
      - Position: ${lead.position}
      - Industry: ${lead.industry}
      - Status: ${lead.status}
      - Priority: ${lead.priority}
      - Source: ${lead.source}
      - AI-Generated Score (out of 100): ${lead.aiScore} (This score predicts the likelihood of conversion. Higher is better.)
      - Last Contacted: ${lead.lastContacted}
      - Notes: ${lead.notes}

      Provide your analysis below:
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating lead insight:", error);
    return "An error occurred while generating AI insights. Please check the console for more details.";
  }
};


export const generateSalesContent = async (prompt: string): Promise<string> => {
  if (!ai) {
    return Promise.resolve("AI functionality is disabled. Please configure your API key.");
  }
  
  try {
    // These contexts would be dynamically loaded from the user's settings (Workflows/Documents tabs)
    const personaContext = "You are an expert sales assistant for a company called AILeadIQ. Your name is Alex. Your tone is professional, helpful, and concise. You are writing on behalf of the user.";
    const knowledgeBaseContext = "AILeadIQ is an autonomous sales workflow platform. Key features include AI agents for lead qualification and meeting booking. We sell to Real Estate, Finance, and Tech industries. Our main competitor is SalesBot, but we offer better multilingual support and deeper CRM integration.";

    const fullPrompt = `${personaContext}\n\nUse the following knowledge base to answer the user's request:\n${knowledgeBaseContext}\n\n---\n\nUser Request: ${prompt}`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating sales content:", error);
    return "An error occurred while generating AI content. Please check the console for more details.";
  }
};