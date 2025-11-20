import React from 'react';
import { ChevronDownIcon, PhoneIcon } from './icons';
import { User } from '../types';

interface SettingsPageProps {
  user: User;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
  const currentPlan = user.isAdmin ? 'Enterprise' : 'Gold';
  const planColor = user.isAdmin ? 'purple' : 'yellow';

  return (
    <div className="max-w-4xl mx-auto space-y-8" data-testid="settings-page-container">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700" data-testid="settings-panel-company-info">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Company Information</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Update your company's profile and details.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
            <input type="text" id="companyName" defaultValue="top loader agent ai" data-testid="settings-input-company-name" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Email</label>
            <input type="email" id="companyEmail" defaultValue="colinloader061@gmail.com" data-testid="settings-input-company-email" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div className="relative">
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Industry</label>
            <select id="industry" defaultValue="Real Estate" data-testid="settings-select-industry" className="appearance-none mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option>Technology</option>
              <option>Real Estate</option>
              <option>Finance</option>
              <option>Healthcare</option>
            </select>
            <ChevronDownIcon className="h-5 w-5 text-gray-400 absolute right-3 top-8 pointer-events-none" />
          </div>
          <div>
            <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Team Size</label>
            <input type="number" id="teamSize" defaultValue="1" data-testid="settings-input-team-size" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button data-testid="settings-button-save-company-info" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition-colors">Save Changes</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700" data-testid="settings-panel-subscription">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Subscription</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Manage your billing and plan.</p>
        <div className={`bg-${planColor}-50 dark:bg-${planColor}-900/30 border border-${planColor}-200 dark:border-${planColor}-800 p-6 rounded-lg flex justify-between items-center`}>
          <div>
            <p className="font-semibold text-gray-800 dark:text-white">Current Plan: <span className={`text-${planColor}-600 dark:text-${planColor}-400 font-bold text-lg`}>{currentPlan}</span></p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your plan renews on 11/2/2025.</p>
          </div>
          <button data-testid="settings-button-upgrade-plan" className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold transition-colors">Manage Subscription</button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700" data-testid="settings-panel-call-testing">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">System & Call Testing</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Test your AI agent's calling capabilities and check your inbound line status.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">Outbound Call Test</h3>
                <div>
                    <label htmlFor="testPhoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number to Call</label>
                    <input type="tel" id="testPhoneNumber" placeholder="+1 (555) 123-4567" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="testScript" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Test Script</label>
                    <textarea id="testScript" rows={3} placeholder="Hello, this is a test call from AILeadIQ..." className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <button className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition-colors">
                    <PhoneIcon className="h-5 w-5 mr-2" />
                    Run Test Call
                </button>
            </div>
            <div className="space-y-4">
                 <h3 className="font-semibold text-gray-700 dark:text-gray-200">Inbound Call Status</h3>
                 <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col justify-center">
                     <p className="text-sm text-gray-500 dark:text-gray-400">Assigned Inbound Number</p>
                     <p className="text-xl font-mono font-semibold text-gray-800 dark:text-white mt-1">+1 (888) 555-AIQI</p>
                     <div className="flex items-center mt-4">
                         <div className="relative flex items-center justify-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full absolute animate-ping"></div>
                         </div>
                         <span className="ml-3 text-green-600 dark:text-green-400 font-semibold">Online - Ready to receive calls</span>
                     </div>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;