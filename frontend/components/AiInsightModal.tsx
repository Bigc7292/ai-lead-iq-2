import React from 'react';
import { Lead } from '../types';
import { SparklesIcon } from './icons';

interface AiInsightModalProps {
  lead: Lead | null;
  insight: string;
  isLoading: boolean;
  onClose: () => void;
}

const AiInsightModal: React.FC<AiInsightModalProps> = ({ lead, insight, isLoading, onClose }) => {
  if (!lead) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity" data-testid="ai-insight-modal-container">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 transform transition-all">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center">
            <SparklesIcon className="h-6 w-6 text-indigo-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Insight for {lead.name}</h2>
          </div>
          <button onClick={onClose} data-testid="ai-insight-modal-button-close" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48" data-testid="ai-insight-modal-loading-indicator">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Generating insights...</p>
            </div>
          ) : (
            <div data-testid="ai-insight-modal-content-container" className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {insight.split('\n').map((line, index) => <p key={index}>{line}</p>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiInsightModal;