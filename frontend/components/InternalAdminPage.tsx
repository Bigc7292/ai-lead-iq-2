import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell } from 'recharts';
import KpiCard from './KpiCard';

// Mock data for the new admin page requirements
const coreKpiData = {
    activeClients: { value: "1,250", change: "+2.5% MoM", type: 'increase' },
    activeUsers: { value: "8,750", change: "+3.1% MoM", type: 'increase' },
    minutesUsed: { value: "2.1M min", change: "+8.2% MoM", type: 'increase' },
    mrr: { value: "$157,500", change: "+4.5% MoM", type: 'increase' }
};

const revenueBreakdownData = {
    outbound: { value: "$110,250", change: "70% of total", type: 'increase' },
    inbound: { value: "$31,500", change: "20% of total", type: 'increase' },
    addOns: { value: "$15,750", change: "10% of total", type: 'increase' }
};

const costPerMeetingByPackage = [
    { package: 'Bronze', cost: 12.20 },
    { package: 'Silver', cost: 9.50 },
    { package: 'Gold', cost: 7.00 },
    { package: 'Enterprise', cost: 5.80 },
];

const activityByPackage = [
    { name: 'Bronze', calls: 84000, meetings: 4200 },
    { name: 'Silver', calls: 126000, meetings: 6300 },
    { name: 'Gold', calls: 76000, meetings: 3800 },
    { name: 'Enterprise', calls: 30400, meetings: 1520 },
];


const InternalAdminPage: React.FC = () => {
    const [globalInterval, setGlobalInterval] = React.useState('Monthly');
    return (
        <div className="space-y-8" data-testid="internal-admin-page-container">
            {/* Global Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between flex-wrap gap-4" data-testid="internal-admin-panel-global-filters">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Business Intelligence Overview</h2>
                <div className="flex items-center space-x-4">
                     <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg" data-testid="internal-admin-button-group-interval">
                        {['Daily', 'Weekly', 'Monthly'].map(item => (
                            <button
                                key={item}
                                onClick={() => setGlobalInterval(item)}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                                    globalInterval === item
                                        ? 'bg-indigo-600 text-white shadow'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                     <input type="date" defaultValue={new Date().toISOString().split('T')[0]} data-testid="internal-admin-input-date-picker" className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
            </div>

            {/* Section 1: Core Financial & Client Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="internal-admin-panel-core-metrics">
                <KpiCard title="Monthly Recurring Revenue (MRR)" value={coreKpiData.mrr.value} change={coreKpiData.mrr.change} changeType={coreKpiData.mrr.type as 'increase' | 'decrease'} data-testid="internal-admin-kpi-card-mrr" />
                <KpiCard title="Total Active Clients (Accounts)" value={coreKpiData.activeClients.value} change={coreKpiData.activeClients.change} changeType={coreKpiData.activeClients.type as 'increase' | 'decrease'} data-testid="internal-admin-kpi-card-active-clients" />
                <KpiCard title="Total Active Users (Seats)" value={coreKpiData.activeUsers.value} change={coreKpiData.activeUsers.change} changeType={coreKpiData.activeUsers.type as 'increase' | 'decrease'} data-testid="internal-admin-kpi-card-active-users" />
                <KpiCard title="Total Platform Minutes Used" value={coreKpiData.minutesUsed.value} change={coreKpiData.minutesUsed.change} changeType={coreKpiData.minutesUsed.type as 'increase' | 'decrease'} data-testid="internal-admin-kpi-card-minutes-used" />
            </div>
            
             {/* Section 2: Detailed Revenue Breakdown */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm" data-testid="internal-admin-panel-revenue-breakdown">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Detailed Revenue Breakdown</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <KpiCard title="Revenue from Outbound Calls" value={revenueBreakdownData.outbound.value} change={revenueBreakdownData.outbound.change} changeType={revenueBreakdownData.outbound.type as 'increase' | 'decrease'} data-testid="internal-admin-kpi-card-revenue-outbound" />
                    <KpiCard title="Revenue from Inbound Calls" value={revenueBreakdownData.inbound.value} change={revenueBreakdownData.inbound.change} changeType={revenueBreakdownData.inbound.type as 'increase' | 'decrease'} data-testid="internal-admin-kpi-card-revenue-inbound" />
                    <KpiCard title="Revenue from Add-on Minutes" value={revenueBreakdownData.addOns.value} change={revenueBreakdownData.addOns.change} changeType={revenueBreakdownData.addOns.type as 'increase' | 'decrease'} data-testid="internal-admin-kpi-card-revenue-addons" />
                </div>
            </div>

            {/* Section 3: Package & Profitability Analysis */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm" data-testid="internal-admin-panel-package-analysis">
                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Package & Profitability Analysis</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                    <div data-testid="internal-admin-chart-container-cost-per-meeting">
                         <h4 className="text-lg font-semibold text-center text-gray-700 dark:text-gray-300 mb-4">Average Cost Per Meeting Booked</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={costPerMeetingByPackage} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(229, 231, 235, 0.5)" />
                                <XAxis dataKey="package" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} interval={0} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} unit="$" />
                                <Tooltip
                                    cursor={{fill: 'rgba(243, 244, 246, 0.5)'}}
                                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                                    formatter={(value) => [`$${value}`, 'Avg. Cost / Meeting']}
                                />
                                <Bar dataKey="cost" name="Avg Cost / Meeting" barSize={40} radius={[10, 10, 0, 0]}>
                                    {costPerMeetingByPackage.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`rgba(79, 70, 229, ${1 - index * 0.15})`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                     <div data-testid="internal-admin-chart-container-activity-volume">
                        <h4 className="text-lg font-semibold text-center text-gray-700 dark:text-gray-300 mb-4">Activity Volume by Package</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={activityByPackage} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: '#6B7280' }} />
                                <YAxis tick={{ fill: '#6B7280' }} />
                                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}/>
                                <Legend />
                                <Bar dataKey="calls" fill="#8884d8" name="Total Calls Attempted" barSize={20} />
                                <Bar dataKey="meetings" fill="#82ca9d" name="Total Meetings Booked" barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InternalAdminPage;