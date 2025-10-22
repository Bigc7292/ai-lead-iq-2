import React, { useState } from 'react';
import { ChevronDownIcon, UploadIcon } from './icons';

interface CreateCampaignModalProps {
    onClose: () => void;
    onAddCampaign: (campaign: any) => void;
}

const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ onClose, onAddCampaign }) => {
    const [source, setSource] = useState('manual');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock submission
        onAddCampaign({ name: 'New Campaign', source });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity" data-testid="create-campaign-modal-container">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Campaign</h2>
                    <button onClick={onClose} data-testid="create-campaign-modal-button-close" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label htmlFor="campaignName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Campaign Name</label>
                            <input type="text" id="campaignName" name="campaignName" placeholder="e.g., Q4 Tech Outreach" required className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        
                        <div data-testid="create-campaign-modal-panel-source-selection">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lead Source</label>
                            <div className="grid grid-cols-2 gap-3">
                                <SourceOption id="manual" label="Manual Upload (CSV)" current={source} setter={setSource} />
                                <SourceOption id="internal" label="From Existing Leads" current={source} setter={setSource} />
                                <SourceOption id="social" label="Social Media Ad" current={source} setter={setSource} />
                                <SourceOption id="api" label="API / Webhook" current={source} setter={setSource} />
                            </div>
                        </div>

                        {source === 'social' && (
                             <div className="p-4 border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/30 rounded-lg space-y-4" data-testid="create-campaign-modal-panel-social-connect">
                                <div className="text-center">
                                    <h4 className="font-semibold text-blue-800 dark:text-blue-300">Connect Ad Account</h4>
                                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 mb-3">Automatically import new leads from your Facebook or Instagram lead forms.</p>
                                    <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700">Connect Account</button>
                                </div>
                                <div className="pt-4 border-t border-blue-200 dark:border-blue-800">
                                    <label htmlFor="workflowTrigger" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Trigger Workflow on New Lead</label>
                                    <div className="relative mt-1">
                                        <select id="workflowTrigger" name="workflowTrigger" className="appearance-none block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                            <option>New Lead Qualification</option>
                                            <option>Social Media Fast Track</option>
                                            <option>Do not trigger workflow</option>
                                        </select>
                                        <ChevronDownIcon className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        )}
                        
                    </div>
                    <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} data-testid="create-campaign-modal-button-cancel" className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
                        <button type="submit" data-testid="create-campaign-modal-button-submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Create Campaign</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SourceOption: React.FC<{id: string, label: string, current: string, setter: (id: string) => void}> = ({id, label, current, setter}) => (
    <div 
        onClick={() => setter(id)}
        className={`p-4 border rounded-lg cursor-pointer text-center font-semibold transition-all ${current === id ? 'bg-indigo-500 text-white border-indigo-500 ring-2 ring-indigo-300' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-indigo-400'}`}
    >
        {label}
    </div>
);

export default CreateCampaignModal;