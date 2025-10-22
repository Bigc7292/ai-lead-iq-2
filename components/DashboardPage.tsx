import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell } from 'recharts';
import { Lead } from '../types';
import KpiCard from './KpiCard';

interface DashboardPageProps {
    onViewLead: (lead: Lead) => void;
}

const kpiSummaryData = {
    All: { totalCalls: 1240, meetingsBooked: 32, talkTime: 9800, totalCost: 4016, emailsSent: 1500, smsSent: 800, noAnswer: 248, callbackRequests: 45, notInterested: 88 },
    Outbound: { totalCalls: 980, meetingsBooked: 25, talkTime: 8200, totalCost: 3960, emailsSent: 1200, smsSent: 600, noAnswer: 196, callbackRequests: 35, notInterested: 70 },
    Inbound: { totalCalls: 260, meetingsBooked: 7, talkTime: 1600, totalCost: 56, emailsSent: 300, smsSent: 200, noAnswer: 52, callbackRequests: 10, notInterested: 18 },
};

const getFilteredKpiData = (callType: string) => {
    const baseData = kpiSummaryData[callType as keyof typeof kpiSummaryData] || kpiSummaryData.All;

    const meetings = baseData.meetingsBooked;
    const totalCost = baseData.totalCost;

    return {
        totalCalls: baseData.totalCalls.toLocaleString(),
        meetingsBooked: meetings.toLocaleString(),
        talkTime: `${(baseData.talkTime / 60).toFixed(0)} min`,
        avgCostPerMeeting: meetings > 0 ? `$${(totalCost / meetings).toFixed(2)}` : '$0.00',
        emailsSent: baseData.emailsSent.toLocaleString(),
        smsSent: baseData.smsSent.toLocaleString(),
        funnel: {
            answered: baseData.totalCalls - baseData.noAnswer,
            notInterested: baseData.notInterested,
            callbackRequests: baseData.callbackRequests,
            meetingsBooked: meetings,
        }
    };
};

const engagementTrendData = [
    { name: 'Mon', calls: 180, talkTime: 1200, meetings: 5 },
    { name: 'Tue', calls: 225, talkTime: 1500, meetings: 7 },
    { name: 'Wed', calls: 275, talkTime: 1800, meetings: 6 },
    { name: 'Thu', calls: 250, talkTime: 1700, meetings: 8 },
    { name: 'Fri', calls: 310, talkTime: 2100, meetings: 9 },
    { name: 'Sat', calls: 140, talkTime: 900, meetings: 3 },
    { name: 'Sun', calls: 105, talkTime: 700, meetings: 2 },
];

const IndividualIntervalToggle: React.FC<{ initialInterval?: string, "data-testid": string }> = ({ initialInterval = 'Weekly', "data-testid": dataTestId }) => {
  const [localInterval, setLocalInterval] = React.useState(initialInterval.charAt(0).toUpperCase());
  return (
    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg" data-testid={dataTestId}>
      {[{label: 'D', value: 'Daily'}, {label: 'W', value: 'Weekly'}, {label: 'M', value: 'Monthly'}].map(item => (
        <button
          key={item.label}
          onClick={() => setLocalInterval(item.label)}
          className={`px-2 py-0.5 text-xs font-semibold rounded-md transition-colors ${
            localInterval === item.label
              ? 'bg-indigo-500 text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          aria-label={`Set interval to ${item.value}`}
          data-testid={`${dataTestId}-button-${item.value.toLowerCase()}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

const DashboardPage: React.FC<DashboardPageProps> = ({ onViewLead }) => {
    const [globalInterval, setGlobalInterval] = useState('Weekly');
    const [callType, setCallType] = useState('All');
    
    const currentKpiData = getFilteredKpiData(callType);
    const funnelData = [
        { name: 'Meetings Booked', value: currentKpiData.funnel.meetingsBooked, total: currentKpiData.funnel.answered },
        { name: 'Callback Request', value: currentKpiData.funnel.callbackRequests, total: currentKpiData.funnel.answered },
        { name: 'Not Interested', value: currentKpiData.funnel.notInterested, total: currentKpiData.funnel.answered },
        { name: 'Answered', value: currentKpiData.funnel.answered, total: currentKpiData.funnel.answered },
    ].reverse();

    return (
        <div className="space-y-8" data-testid="dashboard-page-container">
            {/* Global Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between flex-wrap gap-4" data-testid="dashboard-panel-global-filters">
                <div className="flex items-center space-x-4 flex-wrap gap-4">
                    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg" data-testid="dashboard-filter-container-call-type">
                        {['All', 'Outbound', 'Inbound'].map(item => (
                             <button
                                key={item}
                                onClick={() => setCallType(item)}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                                    callType === item
                                        ? 'bg-indigo-600 text-white shadow'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                                data-testid={`dashboard-button-filter-call-type-${item.toLowerCase()}`}
                            >
                                {item} Calls
                            </button>
                        ))}
                    </div>
                     <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg" data-testid="dashboard-filter-container-time-interval">
                        {['Daily', 'Weekly', 'Monthly'].map(item => (
                            <button
                                key={item}
                                onClick={() => setGlobalInterval(item)}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                                    globalInterval === item
                                        ? 'bg-indigo-600 text-white shadow'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                                data-testid={`dashboard-button-filter-time-interval-${item.toLowerCase()}`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                     <input type="date" className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" data-testid="dashboard-input-filter-date-picker"/>
                </div>
            </div>

            {/* Section A: Top-Level Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6" data-testid="dashboard-panel-kpi-snapshot">
                <KpiCard title="Total Calls Attempted" value={currentKpiData.totalCalls} change="+15% vs. last period" changeType="increase" data-testid="dashboard-kpi-card-total-calls" />
                <KpiCard title="Meetings Booked" value={currentKpiData.meetingsBooked} change="+5% vs. last period" changeType="increase" data-testid="dashboard-kpi-card-meetings-booked" />
                <KpiCard title="Total Talk Time" value={currentKpiData.talkTime} change="+8% vs. last period" changeType="increase" data-testid="dashboard-kpi-card-talk-time" />
                <KpiCard title="Avg. Cost / Meeting" value={currentKpiData.avgCostPerMeeting} change="-2% vs. last period" changeType="decrease" data-testid="dashboard-kpi-card-avg-cost-per-meeting" />
                <KpiCard title="Total Emails Sent" value={currentKpiData.emailsSent} change="+12% vs. last period" changeType="increase" data-testid="dashboard-kpi-card-emails-sent" />
                <KpiCard title="Total SMS Sent" value={currentKpiData.smsSent} change="+9% vs. last period" changeType="increase" data-testid="dashboard-kpi-card-sms-sent" />
            </div>

            {/* Section B: Outreach & Conversion Funnel */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" data-testid="dashboard-panel-charts-volume-conversion">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm" data-testid="dashboard-panel-chart-volume-trend">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Volume & Engagement Trend</h3>
                        <IndividualIntervalToggle initialInterval={globalInterval} data-testid="dashboard-chart-button-group-interval-volume-trend"/>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                         <LineChart data={engagementTrendData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(229, 231, 235, 0.5)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="calls" name="Calls Attempted" stroke="#4F46E5" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            <Line yAxisId="right" type="monotone" dataKey="talkTime" name="Talk Time (mins)" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
                            <Line yAxisId="right" type="monotone" dataKey="meetings" name="Meetings Booked" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm" data-testid="dashboard-panel-chart-conversion-funnel">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Conversion Funnel (Answered Calls)</h3>
                         <IndividualIntervalToggle initialInterval={globalInterval} data-testid="dashboard-chart-button-group-interval-conversion-funnel"/>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={funnelData} layout="vertical" margin={{ top: 20, right: 40, left: 30, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(229, 231, 235, 0.5)" />
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} width={100} />
                            <Tooltip cursor={{fill: 'rgba(243, 244, 246, 0.5)'}} contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}/>
                            <Bar dataKey="value" name="Count" fill="#4F46E5" barSize={25} radius={[0, 10, 10, 0]}>
                                {funnelData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={`rgba(79, 70, 229, ${1 - index * 0.2})`} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Section C: Efficiency & Geographic Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" data-testid="dashboard-panel-charts-efficiency-geo">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm" data-testid="dashboard-panel-map-meetings-location">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Geo-Performance: Conversion Rate by Area</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Percentage of answered calls that result in a booked meeting for each region.</p>
                    <div className="h-80 bg-gray-100 dark:bg-gray-900/50 rounded-lg flex items-center justify-center p-4 relative">
                        <svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="#D1D5DB" stroke="#FFF" strokeWidth="1">
                            {/* Simplified world map paths */}
                            <path d="M400 0 L450 50 L400 100 L350 50 Z" fill="#E0E7FF" />
                            <path d="M100 200 L150 250 L100 300 L50 250 Z" fill="#E0E7FF" />
                            <path d="M600 300 L650 350 L600 400 L550 350 Z" fill="#E0E7FF" />
                            <path d="M300 350 L350 400 L300 450 L250 400 Z" fill="#E0E7FF" />
                            <path d="M700 100 L750 150 L700 200 L650 150 Z" fill="#E0E7FF" />
                            <path d="M20,100 a 80,80 0 1,0 160,0 a 80,80 0 1,0 -160,0" fill="#E0E7FF"/>
                            <path d="M350,150 a 100,100 0 1,1 200,0 a 100,100 0 1,1 -200,0" fill="#E0E7FF"/>
                            <path d="M550,250 a 120,120 0 1,0 240,0 a 120,120 0 1,0 -240,0" fill="#E0E7FF"/>
                            <path d="M150,300 a 70,70 0 1,1 140,0 a 70,70 0 1,1 -140,0" fill="#E0E7FF"/>
                        </svg>
                         {/* Data points overlay */}
                         <div className="absolute inset-0 flex items-center justify-center">
                            <div className="absolute" style={{ top: '25%', left: '20%' }}>
                                <div className="w-16 h-16 bg-green-500/80 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-lg">
                                    <span>28%</span>
                                    <span className="text-xs font-normal">NA</span>
                                </div>
                            </div>
                            <div className="absolute" style={{ top: '40%', left: '50%' }}>
                                <div className="w-20 h-20 bg-green-600/80 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-lg">
                                    <span>35%</span>
                                    <span className="text-xs font-normal">EMEA</span>
                                </div>
                            </div>
                            <div className="absolute" style={{ bottom: '20%', right: '20%' }}>
                                 <div className="w-12 h-12 bg-red-500/80 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-lg">
                                    <span>12%</span>
                                    <span className="text-xs font-normal">APAC</span>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;