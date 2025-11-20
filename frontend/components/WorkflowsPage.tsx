import React from 'react';
import { SparklesIcon, PlusIcon, PhoneIcon, MailIcon, BranchIcon, MessageIcon } from './icons';

interface WorkflowTemplate {
    title: string;
    description: string;
    steps: { name: string, icon: React.FC<React.SVGProps<SVGSVGElement>> }[];
    isRecommended?: boolean;
}

const templates: WorkflowTemplate[] = [
    {
        title: "New Lead Qualification",
        description: "Automatically qualify new leads and route them to the appropriate team members.",
        steps: [{name: "Initial Contact", icon: PhoneIcon}, {name: "Send SMS", icon: MessageIcon}, {name: "Qualify", icon: BranchIcon}, {name: "Route", icon: MailIcon}],
        isRecommended: true
    },
    {
        title: "Long-term Follow-up",
        description: "Automated sequence for leads who showed interest but haven't converted yet.",
        steps: [{name: "Day 3 Email", icon: MailIcon}, {name: "Day 7 Call", icon: PhoneIcon}, {name: "Day 14 SMS", icon: MessageIcon}, {name: "Final Contact", icon: PhoneIcon}],
        isRecommended: true
    },
    {
        title: "Re-engagement Campaign",
        description: "Win back inactive or cold leads with a targeted outreach sequence.",
        steps: [{name: "Identify Inactive", icon: SparklesIcon}, {name: "Re-engagement Email", icon: MailIcon}, {name: "Offer via SMS", icon: MessageIcon}, {name: "Follow-up Call", icon: PhoneIcon}]
    },
    {
        title: "Meeting Confirmation",
        description: "Automated meeting confirmation and reminder workflow for booked meetings.",
        steps: [{name: "Send Confirmation", icon: MailIcon}, {name: "24hr Reminder", icon: MessageIcon}, {name: "1hr Reminder", icon: MailIcon}],
    }
];

const WorkflowCard: React.FC<{ template: WorkflowTemplate; onCreateWorkflow: () => void; }> = ({ template, onCreateWorkflow }) => (
    <div data-testid={`workflows-card-container-${template.title.replace(/\s+/g, '-').toLowerCase()}`} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-full hover:shadow-lg hover:border-indigo-500 dark:hover:border-indigo-500 transition-all">
        <div className="flex-grow">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">{template.title}</h3>
                {template.isRecommended && (
                    <div className="flex items-center text-xs font-medium text-yellow-600 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/50 px-2 py-1 rounded-full">
                        <SparklesIcon className="h-4 w-4 mr-1" />
                        Recommended
                    </div>
                )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{template.description}</p>
            
            <div className="font-semibold text-sm text-gray-600 dark:text-gray-300 mb-3">Workflow Steps:</div>
            <div className="flex items-center space-x-2">
                {template.steps.map((step, index) => (
                    <React.Fragment key={index}>
                        <div className="flex flex-col items-center text-center">
                            <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
                                <step.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-300"/>
                            </div>
                            <span className="text-xs text-gray-500 mt-1">{step.name}</span>
                        </div>
                        {index < template.steps.length - 1 && <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600"></div>}
                    </React.Fragment>
                ))}
            </div>
        </div>
        <button 
            onClick={onCreateWorkflow}
            data-testid={`workflows-card-button-use-template-${template.title.replace(/\s+/g, '-').toLowerCase()}`}
            className="w-full mt-8 py-2.5 px-4 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-semibold rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors">
            Use Template
        </button>
    </div>
);


interface WorkflowsPageProps {
    onCreateWorkflow: () => void;
}

const WorkflowsPage: React.FC<WorkflowsPageProps> = ({ onCreateWorkflow }) => {
  return (
    <div className="space-y-6" data-testid="workflows-page-container">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">AI Workflows & Automations</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Build and manage your automated sales processes.</p>
            </div>
            <button
                onClick={onCreateWorkflow}
                className="flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-semibold"
                data-testid="workflows-button-create-new"
            >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create New Workflow
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="workflows-grid-container">
            {templates.map(template => (
                <WorkflowCard key={template.title} template={template} onCreateWorkflow={onCreateWorkflow} />
            ))}
        </div>
    </div>
  );
};

export default WorkflowsPage;