import React, { useState } from 'react';
import { SparklesIcon, ClipboardListIcon, MailIcon, ShieldIcon, MessageIcon, DocumentsIcon, ThumbsUpIcon, ThumbsDownIcon, BookOpenIcon, TeamIcon } from './icons';
import { generateSalesContent } from '../services/geminiService';
import { CampaignsIcon } from './icons';


const templates = [
    { 
        icon: ClipboardListIcon, 
        title: 'Generate Call Script', 
        description: 'Create a script for a specific lead or scenario.',
        prompt: 'Generate a friendly but professional outbound call script to introduce AILeadIQ to a new lead named [Lead Name] from [Company Name] in the [Industry] industry. The goal is to book a 15-minute discovery call.'
    },
    { 
        icon: MailIcon, 
        title: 'Email Follow-up', 
        description: 'Draft a compelling follow-up email.',
        prompt: 'Write a concise follow-up email to a prospect in the Real Estate industry who recently had a demo but has not responded. Reiterate the value proposition and suggest next steps.'
    },
    { 
        icon: ShieldIcon, 
        title: 'Objection Handler', 
        description: 'Get responses for common sales objections.',
        prompt: 'Provide 3-5 concise and effective responses to the objection: "Your service is too expensive compared to competitors like SalesBot."'
    },
    { 
        icon: MessageIcon, 
        title: 'Lead Qualification Questions', 
        description: 'Generate questions to qualify a new lead.',
        prompt: 'List 5 powerful, open-ended questions to qualify a new inbound lead from the Finance industry to understand their needs, budget, and decision-making process.'
    },
];

const playbooks = [
    {
        icon: ShieldIcon,
        title: 'Handling Real Estate Objections',
        description: 'Navigate common objections from real estate leads (e.g., "market is too slow").',
        prompt: 'Act as a sales coach. I am talking to a real estate lead who said "the market is too slow right now". Give me a step-by-step conversational strategy to handle this objection effectively.'
    },
    {
        icon: TeamIcon,
        title: 'Multi-Stakeholder Deal (Finance)',
        description: 'Craft a strategy to convince multiple decision-makers in the finance sector.',
        prompt: 'Act as a sales strategist. I need to convince both an Analyst (my champion) and their Director at a finance company. Outline a strategy and key talking points for a joint call.'
    }
];

const TemplateCard: React.FC<{ template: typeof templates[0], onSelect: (prompt: string) => void }> = ({ template, onSelect }) => (
    <button 
        onClick={() => onSelect(template.prompt)}
        className="w-full bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-left hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-md transition-all flex items-start space-x-4"
    >
        <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 rounded-lg p-2.5">
            <template.icon className="h-6 w-6" />
        </div>
        <div>
            <h4 className="font-bold text-gray-800 dark:text-white">{template.title}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{template.description}</p>
        </div>
    </button>
);

const PlaybookCard: React.FC<{ playbook: typeof playbooks[0], onSelect: (prompt: string) => void }> = ({ playbook, onSelect }) => (
    <button
        onClick={() => onSelect(playbook.prompt)}
        className="w-full bg-indigo-50 dark:bg-gray-800 p-4 rounded-xl shadow-sm border-2 border-indigo-200 dark:border-gray-700 text-left hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-md transition-all flex items-start space-x-4"
    >
        <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 rounded-lg p-2.5">
            <playbook.icon className="h-6 w-6" />
        </div>
        <div>
            <h4 className="font-bold text-gray-800 dark:text-white">{playbook.title}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{playbook.description}</p>
        </div>
    </button>
);


const LoadingSkeleton = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
    </div>
);

const AIAssistantPage: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

    const handleGenerate = async () => {
        if (!prompt || isLoading) return;
        setIsLoading(true);
        setOutput('');
        setFeedback(null);
        const result = await generateSalesContent(prompt);
        setOutput(result);
        setIsLoading(false);
    };
    
    return (
        <div className="flex flex-col md:flex-row gap-8 h-full" data-testid="ai-assistant-page-container">
            {/* --- Sidebar --- */}
            <aside className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
                <div className="space-y-4">
                    <h3 className="flex items-center text-lg font-semibold text-gray-800 dark:text-white px-2 mb-2">
                        <BookOpenIcon className="h-6 w-6 mr-2" />
                        Sales Playbooks
                    </h3>
                    {playbooks.map(playbook => (
                        <PlaybookCard key={playbook.title} playbook={playbook} onSelect={setPrompt} />
                    ))}
                </div>
                <div className="mt-8 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white px-2">Quick Templates</h3>
                    {templates.map(template => (
                        <TemplateCard key={template.title} template={template} onSelect={setPrompt} />
                    ))}
                </div>
                <div className="mt-8 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-200">Usage</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">1,234 / 5,000 tokens used this month.</p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                        <div className="bg-indigo-600 h-2.5 rounded-full" style={{width: '24%'}}></div>
                    </div>
                </div>
            </aside>

            {/* --- Main Content --- */}
            <main className="flex-1 flex flex-col">
                <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    {/* Output Area */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {isLoading ? (
                            <LoadingSkeleton />
                        ) : output ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">{output}</div>
                        ) : (
                            <div className="text-center text-gray-400 dark:text-gray-500 h-full flex flex-col justify-center items-center">
                                <SparklesIcon className="h-12 w-12 mb-2" />
                                <p className="font-semibold">Your generated content will appear here.</p>
                                <p className="text-sm">Start by entering a request below or select a template.</p>
                            </div>
                        )}
                    </div>

                    {/* Actions and Feedback */}
                    {output && !isLoading && (
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <button className="flex items-center px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 font-medium text-gray-700 dark:text-gray-200">
                                    <DocumentsIcon className="h-4 w-4 mr-2" /> Save to Documents
                                </button>
                                <button className="flex items-center px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 font-medium text-gray-700 dark:text-gray-200">
                                    <CampaignsIcon className="h-4 w-4 mr-2" /> Use in Campaign
                                </button>
                            </div>
                            <div className="flex items-center space-x-1">
                                <button onClick={() => setFeedback('up')} className={`p-1.5 rounded-md ${feedback === 'up' ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                    <ThumbsUpIcon className="h-5 w-5" />
                                </button>
                                <button onClick={() => setFeedback('down')} className={`p-1.5 rounded-md ${feedback === 'down' ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                    <ThumbsDownIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter your request... (e.g., 'Write a follow-up email for a prospect in the Real Estate industry who asked for pricing...')"
                        rows={4}
                        className="w-full p-2 bg-transparent text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-none"
                    />
                    <div className="flex justify-end pt-2">
                        <button 
                            onClick={handleGenerate} 
                            disabled={isLoading || !prompt}
                            className="flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-semibold disabled:bg-indigo-400 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed"
                            data-testid="ai-assistant-button-generate"
                        >
                            <SparklesIcon className="h-5 w-5 mr-2" />
                            {isLoading ? 'Generating...' : 'Generate with AI'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AIAssistantPage;