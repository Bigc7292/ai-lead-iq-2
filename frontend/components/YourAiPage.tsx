import React, { useState } from 'react';
import AIAssistantPage from './AIAssistantPage';
import LiveConversationPage from './LiveConversationPage';
import WorkflowsPage from './WorkflowsPage';
import CreateWorkflowModal from './CreateWorkflowModal';

const YourAiPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('flows');
    const [isCreateWorkflowModalOpen, setIsCreateWorkflowModalOpen] = useState(false);

    const renderContent = () => {
        switch (activeTab) {
            case 'flows':
                return <WorkflowsPage onCreateWorkflow={() => setIsCreateWorkflowModalOpen(true)} />;
            case 'test':
                return <LiveConversationPage />;
            case 'assistant':
                return <AIAssistantPage />;
            default:
                return null;
        }
    };

    const TabButton: React.FC<{ tabName: string; label: string }> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === tabName
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <TabButton tabName="flows" label="Flows" />
                    <TabButton tabName="test" label="Test Your AI" />
                    <TabButton tabName="assistant" label="AI Assistant" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {renderContent()}
            </div>
            {isCreateWorkflowModalOpen && (
                <CreateWorkflowModal
                    onClose={() => setIsCreateWorkflowModalOpen(false)}
                />
            )}
        </div>
    );
};

export default YourAiPage;
