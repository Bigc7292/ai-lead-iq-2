import React, { useState } from 'react';
import { Lead, LeadStatus, LeadPriority } from '../types';
import { mockLeads } from '../data/mockData';
import { PlusIcon, EyeIcon, EditIcon, TrashIcon, DownloadIcon } from './icons';

interface LeadsPageProps {
    onViewLead: (lead: Lead) => void;
    onAddLead: () => void;
}

const statusTabs = [
    { name: 'All', count: 100 },
    { name: LeadStatus.INTERESTED, count: 16 },
    { name: LeadStatus.CONTACTED, count: 34 },
    { name: LeadStatus.QUALIFIED, count: 17 },
    { name: LeadStatus.NOT_INTERESTED, count: 17 },
    { name: LeadStatus.CONVERTED, count: 16 },
];

const statusColorMap: { [key in LeadStatus]: { bg: string, text: string } } = {
    [LeadStatus.NEW]: { bg: 'bg-blue-100', text: 'text-blue-800' },
    [LeadStatus.CONTACTED]: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    [LeadStatus.QUALIFIED]: { bg: 'bg-cyan-100', text: 'text-cyan-800' },
    [LeadStatus.INTERESTED]: { bg: 'bg-green-100', text: 'text-green-800' },
    [LeadStatus.CONVERTED]: { bg: 'bg-purple-100', text: 'text-purple-800' },
    [LeadStatus.NOT_INTERESTED]: { bg: 'bg-red-100', text: 'text-red-800' },
};

const priorityColorMap: { [key in LeadPriority]: { bg: string, text: string } } = {
    'High': { bg: 'bg-red-100', text: 'text-red-800' },
    'Medium': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    'Low': { bg: 'bg-green-100', text: 'text-green-800' },
};

const LeadCard: React.FC<{ lead: Lead, onViewLead: (lead: Lead) => void }> = ({ lead, onViewLead }) => {
    const statusColors = statusColorMap[lead.status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    const priorityColors = priorityColorMap[lead.priority] || { bg: 'bg-gray-100', text: 'text-gray-800' };

    return (
        <div data-testid={`leads-card-container-${lead.id}`} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between space-y-4">
            <div>
                <div className="flex justify-between items-start">
                    <h3 data-testid={`leads-card-text-name-${lead.id}`} className="font-bold text-lg text-gray-800 dark:text-white">{lead.name} {lead.id}</h3>
                    <div className="flex space-x-2">
                        <button onClick={() => onViewLead(lead)} data-testid={`leads-card-button-view-${lead.id}`} className="text-gray-400 hover:text-indigo-500"><EyeIcon className="h-5 w-5"/></button>
                        <button data-testid={`leads-card-button-edit-${lead.id}`} className="text-gray-400 hover:text-green-500"><EditIcon className="h-5 w-5"/></button>
                        <button data-testid={`leads-card-button-delete-${lead.id}`} className="text-gray-400 hover:text-red-500"><TrashIcon className="h-5 w-5"/></button>
                    </div>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                    <span data-testid={`leads-card-badge-status-${lead.id}`} className={`px-2 py-1 text-xs font-semibold rounded-md ${statusColors.bg} ${statusColors.text}`}>
                        {lead.status}
                    </span>
                    <span data-testid={`leads-card-badge-priority-${lead.id}`} className={`px-2 py-1 text-xs font-semibold rounded-md ${priorityColors.bg} ${priorityColors.text}`}>
                        {lead.priority} priority
                    </span>
                </div>
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-300 space-y-2">
                    <p>{lead.company}</p>
                    <p>{lead.position}</p>
                    <p>{lead.phone}</p>
                    <p>{lead.email}</p>
                    <p>Source: {lead.source}</p>
                </div>
            </div>
        </div>
    );
};

const LeadsPage: React.FC<LeadsPageProps> = ({ onViewLead, onAddLead }) => {
    const [activeTab, setActiveTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLeads = mockLeads
        .filter(lead => activeTab === 'All' || lead.status === activeTab)
        .filter(lead => 
            lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.company.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const handleExportCSV = () => {
        if (filteredLeads.length === 0) {
            alert("No leads to export based on the current filters.");
            return;
        }

        const headers = [
            'ID', 'Name', 'Company', 'Email', 'Phone', 'Position', 'Industry',
            'Status', 'Priority', 'Source', 'Notes', 'AI Score', 'Last Contacted'
        ];
        
        const escapeCSV = (str: string) => `"${String(str).replace(/"/g, '""')}"`;

        const csvRows = [
            headers.join(','),
            ...filteredLeads.map(lead => [
                lead.id,
                escapeCSV(lead.name),
                escapeCSV(lead.company),
                escapeCSV(lead.email),
                escapeCSV(lead.phone),
                escapeCSV(lead.position),
                escapeCSV(lead.industry),
                lead.status,
                lead.priority,
                escapeCSV(lead.source),
                escapeCSV(lead.notes),
                lead.aiScore,
                lead.lastContacted
            ].join(','))
        ];

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'leads_export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6" data-testid="leads-page-container">
            <div className="flex justify-between items-center">
                 <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700" data-testid="leads-tabs-container">
                    {statusTabs.map(tab => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                                activeTab === tab.name
                                    ? 'bg-indigo-500 text-white'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                             data-testid={`leads-tab-button-${tab.name.toLowerCase().replace(' ', '-')}`}
                        >
                            {tab.name} ({tab.count})
                        </button>
                    ))}
                </div>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64 pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            data-testid="leads-input-search"
                        />
                         <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center justify-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm font-semibold"
                        data-testid="leads-button-export-csv"
                    >
                        <DownloadIcon className="h-5 w-5 mr-2" />
                        Export CSV
                    </button>
                    <button
                        onClick={onAddLead}
                        className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-semibold"
                        data-testid="leads-button-add-lead"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Lead
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="leads-grid-container">
                {filteredLeads.map(lead => (
                    <LeadCard key={lead.id} lead={lead} onViewLead={onViewLead} />
                ))}
            </div>
        </div>
    );
};

export default LeadsPage;