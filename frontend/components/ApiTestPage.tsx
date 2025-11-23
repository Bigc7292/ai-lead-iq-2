import React, { useEffect, useState } from 'react';
import leadsService from '../services/leadsService';
import authService from '../services/authService';
import { Lead } from '../types';

/**
 * API Connection Test Page
 * Used to verify backend connectivity and data fetching
 */
const ApiTestPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [authStatus, setAuthStatus] = useState<string>('');

    useEffect(() => {
        // Initialize auth
        authService.init();

        if (authService.isAuthenticated()) {
            const user = authService.getUser();
            setAuthStatus(`✅ Authenticated as: ${user?.email} (${user?.role})`);
        } else {
            setAuthStatus('❌ Not authenticated');
        }

        testApiConnection();
    }, []);

    const testApiConnection = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('🔄 Fetching leads from API...');

            const result = await leadsService.getLeads({ limit: 50 });

            console.log('✅ Leads fetched successfully:', result);

            setLeads(result.leads);
            setStats(result.meta);
            setLoading(false);

        } catch (err: any) {
            console.error('❌ Failed to fetch leads:', err);
            setError(err.message || 'Failed to connect to API');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        🧪 API Connection Test
                    </h1>

                    {/* Auth Status */}
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Authentication Status
                        </h2>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{authStatus}</p>
                    </div>

                    {/* API Status */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Backend API Connection
                        </h2>
                        <button
                            onClick={testApiConnection}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            disabled={loading}
                        >
                            {loading ? '🔄 Testing...' : '🔌 Test Connection'}
                        </button>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
                                ❌ Connection Failed
                            </h3>
                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                                Make sure the backend server is running on http://localhost:3000
                            </p>
                        </div>
                    )}

                    {/* Success State - Stats */}
                    {!loading && !error && stats && (
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                📊 Database Stats
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {stats.total || leads.length}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Leads</div>
                                </div>
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {stats.score_avg ? (stats.score_avg * 100).toFixed(1) + '%' : 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Avg Score</div>
                                </div>
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {stats.total_pages || 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Pages</div>
                                </div>
                                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                        {stats.limit || leads.length}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Page Size</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success State - Leads Table */}
                    {!loading && !error && leads.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                📋 Sample Leads (First {leads.length})
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-900">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                Name
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                Email
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                Score
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                Priority
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {leads.slice(0, 10).map((lead) => (
                                            <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                                    {lead.name}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                    {lead.email}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${lead.aiScore >= 80 ? 'bg-green-100 text-green-800' :
                                                            lead.aiScore >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                        }`}>
                                                        {lead.aiScore}%
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                        {lead.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${lead.priority === 'High' ? 'bg-red-100 text-red-800' :
                                                            lead.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {lead.priority}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* No Data State */}
                    {!loading && !error && leads.length === 0 && (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            No leads found in database
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApiTestPage;
