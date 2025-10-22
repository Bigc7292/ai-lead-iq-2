import React from 'react';
import { Campaign, Lead, LeadStatus, CallOutcome } from '../types';
import { ArrowLeftIcon } from './icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell } from 'recharts';
import { mockLeads } from '../data/mockData';

const campaignTrendData = [
    { name: 'Week 1', calls: 180, meetings: 5, costPerMeeting: 80 },
    { name: 'Week 2', calls: 225, meetings: 7, costPerMeeting: 75 },
    { name: 'Week 3', calls: 275, meetings: 6, costPerMeeting: 95 },
    { name: 'Week 4', calls: 250, meetings: 8, costPerMeeting: 60 },
];

const statusColorMap: { [key in LeadStatus]: string } = {
    [LeadStatus.NEW]: 'bg-blue-100 text-blue-800',
    [LeadStatus.CONTACTED]: 'bg-yellow-100 text-yellow-800',
    [LeadStatus.QUALIFIED]: 'bg-cyan-100 text-cyan-800',
    [LeadStatus.INTERESTED]: 'bg-green-100 text-green-800',
    [LeadStatus.CONVERTED]: 'bg-purple-100 text-purple-800',
    [LeadStatus.NOT_INTERESTED]: 'bg-red-100 text-red-800',
};

const LeadRow: React.FC<{ lead: Lead }> = ({ lead }) => (
    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
        <td className="p-3 text-center"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /></td>
        <td className="p-3 font-medium text-gray-900 dark:text-white">{lead.name}</td>
        <td className="p-3 text-gray-500 dark:text-gray-400">{lead.company}</td>
        <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColorMap[lead.status]}`}>{lead.status}</span></td>
        <td className="p-3 text-gray-500 dark:text-gray-400">{lead.lastContacted}</td>
        <td className="p-3"><button className="font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200">View</button></td>
    </tr>
);

interface CampaignDetailPageProps {
    campaign: Campaign;
    onBack: () => void;
}

const CampaignDetailPage: React.FC<CampaignDetailPageProps> = ({ campaign, onBack }) => {
    
    // Mock data for funnel
    const totalAnswered = campaign.callsAnswered;
    const outcomeData = [
        { name: 'No Answer', value: campaign.total - totalAnswered },
        { name: 'Callback Req.', value: Math.round(totalAnswered * 0.15) },
        { name: 'Not Interested', value: Math.round(totalAnswered * 0.25) },
        { name: 'Meeting Booked', value: campaign.meetingsBooked },
    ];

    return (
        <div className="space-y-6" data-testid="campaign-detail-page-container">
            <div>
                <button onClick={onBack} data-testid="campaign-detail-button-back" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold">
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Back to Campaigns
                </button>
            </div>
            
            {/* Analytics Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6" data-testid="campaign-detail-panel-analytics">
                 <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm" data-testid="campaign-detail-chart-performance-trend">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Trend (Weekly)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                         <LineChart data={campaignTrendData} margin={{ top: 30, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(229, 231, 235, 0.5)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} unit="$" />
                            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="calls" name="Calls Attempted" stroke="#4F46E5" strokeWidth={2} />
                            <Line yAxisId="left" type="monotone" dataKey="meetings" name="Meetings Booked" stroke="#10B981" strokeWidth={2} />
                            <Line yAxisId="right" type="monotone" dataKey="costPerMeeting" name="Avg Cost / Meeting" stroke="#F59E0B" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm" data-testid="campaign-detail-chart-outcome-breakdown">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Outcome Breakdown</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={outcomeData} layout="vertical" margin={{ top: 30, right: 30, left: 30, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} width={100} />
                            <Tooltip cursor={{fill: 'rgba(243, 244, 246, 0.5)'}} contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}/>
                            <Bar dataKey="value" name="Count" fill="#4F46E5" barSize={20} radius={[0, 10, 10, 0]}>
                               {outcomeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={`rgba(79, 70, 229, ${1 - index * 0.2})`} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Lead Management Panel */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm" data-testid="campaign-detail-panel-lead-management">
                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Leads in this Campaign ({mockLeads.length})</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="p-3 w-10 text-center"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /></th>
                                <th scope="col" className="p-3">Name</th>
                                <th scope="col" className="p-3">Company</th>
                                <th scope="col" className="p-3">Status</th>
                                <th scope="col" className="p-3">Last Contacted</th>
                                <th scope="col" className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockLeads.slice(0, 5).map(lead => <LeadRow key={lead.id} lead={lead} />)}
                        </tbody>
                    </table>
                 </div>
                 <div className="flex justify-between items-center mt-4">
                     <p className="text-sm text-gray-500">Showing 1-5 of {mockLeads.length} leads</p>
                     <div className="flex space-x-2">
                        <button className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700">&lt; Prev</button>
                        <button className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Next &gt;</button>
                     </div>
                 </div>
            </div>

        </div>
    );
};

export default CampaignDetailPage;