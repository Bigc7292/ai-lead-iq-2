import React, { useState } from 'react';
import { Campaign, CampaignStatus } from '../types';
import { mockCampaigns } from '../data/mockData';
import { PlusIcon, EditIcon, TrashIcon, AlertIcon } from './icons';

const KpiItem: React.FC<{ label: string; value: string | number; className?: string }> = ({ label, value, className = '' }) => (
    <div className={`text-center ${className}`}>
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
    </div>
);

const CampaignCard: React.FC<{ campaign: Campaign; onViewCampaign: (campaign: Campaign) => void; }> = ({ campaign, onViewCampaign }) => {
    const conversionRate = campaign.callsAnswered > 0 
        ? ((campaign.meetingsBooked / campaign.callsAnswered) * 100).toFixed(1)
        : '0.0';

    const statusMap = {
        [CampaignStatus.ACTIVE]: { text: 'text-green-800 dark:text-green-300', bg: 'bg-green-100 dark:bg-green-900/50', dot: 'bg-green-500' },
        [CampaignStatus.PAUSED]: { text: 'text-yellow-800 dark:text-yellow-300', bg: 'bg-yellow-100 dark:bg-yellow-900/50', dot: 'bg-yellow-500' },
        [CampaignStatus.COMPLETED]: { text: 'text-blue-800 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900/50', dot: 'bg-blue-500' },
        [CampaignStatus.DRAFT]: { text: 'text-gray-800 dark:text-gray-300', bg: 'bg-gray-100 dark:bg-gray-700', dot: 'bg-gray-500' },
    };
    const currentStatus = statusMap[campaign.status];
    const isHighCost = campaign.avgCostPerMeeting > 60;

    return (
        <div 
            onClick={() => onViewCampaign(campaign)}
            data-testid={`campaigns-card-container-${campaign.id}`} 
            className={`bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between cursor-pointer hover:shadow-lg hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-200`}>
            <div>
                <div className="flex justify-between items-start mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStatus.bg} ${currentStatus.text}`}>
                        <svg className={`-ml-0.5 mr-1.5 h-2 w-2 ${currentStatus.dot}`} fill="currentColor" viewBox="0 0 8 8">
                            <circle cx="4" cy="4" r="3" />
                        </svg>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                     {isHighCost && (
                        <div className="flex items-center text-xs font-medium text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900/50 px-2 py-1 rounded-full" title="Average cost per meeting is high">
                            <AlertIcon className="h-4 w-4 mr-1" />
                            High Cost
                        </div>
                    )}
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate">{campaign.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Industry: <span className="font-semibold capitalize">{campaign.industry.replace('_', ' ')}</span></p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700">
                <KpiItem label="Conv. Rate" value={`${conversionRate}%`} />
                <KpiItem label="Cost/Meeting" value={`$${campaign.avgCostPerMeeting.toFixed(2)}`} />
                <KpiItem label="Leads" value={`${campaign.progress}/${campaign.total}`} />
            </div>
        </div>
    );
};

interface CampaignsPageProps {
    onViewCampaign: (campaign: Campaign) => void;
    onCreateCampaign: () => void;
}

const CampaignsPage: React.FC<CampaignsPageProps> = ({ onViewCampaign, onCreateCampaign }) => {
    const [activeTab, setActiveTab] = useState('All');

    const statusTabs = [
        { name: 'All', statuses: Object.values(CampaignStatus) },
        { name: 'Active', statuses: [CampaignStatus.ACTIVE] },
        { name: 'Paused', statuses: [CampaignStatus.PAUSED] },
        { name: 'Completed', statuses: [CampaignStatus.COMPLETED, CampaignStatus.DRAFT] },
        { name: 'Alerts', statuses: Object.values(CampaignStatus), isAlert: true },
    ];

    const filteredCampaigns = mockCampaigns.filter(c => {
        const currentFilter = statusTabs.find(t => t.name === activeTab);
        if (!currentFilter) return true;
        if (currentFilter.isAlert) {
            return c.avgCostPerMeeting > 60;
        }
        return currentFilter.statuses.includes(c.status);
    });

  return (
    <div className="space-y-6" data-testid="campaigns-page-container">
        <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700" data-testid="campaigns-tabs-container">
                {statusTabs.map(tab => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors flex items-center ${
                            activeTab === tab.name
                                ? 'bg-indigo-500 text-white shadow'
                                : `text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${tab.name === 'Alerts' ? 'text-red-500 dark:text-red-400' : ''}`
                        }`}
                        data-testid={`campaigns-tab-button-${tab.name.toLowerCase().replace(' ', '-')}`}
                    >
                        {tab.name === 'Alerts' && <AlertIcon className="h-4 w-4 mr-2" />}
                        {tab.name}
                    </button>
                ))}
            </div>
            <button 
                data-testid="campaigns-button-new-campaign" 
                onClick={onCreateCampaign}
                className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-semibold">
                <PlusIcon className="h-5 w-5 mr-2" />
                New Campaign
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="campaigns-grid-container">
            {filteredCampaigns.map(campaign => (
                <CampaignCard key={campaign.id} campaign={campaign} onViewCampaign={onViewCampaign} />
            ))}
        </div>
    </div>
  );
};

export default CampaignsPage;