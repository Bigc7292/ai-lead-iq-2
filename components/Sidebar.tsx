import React from 'react';
import { DashboardIcon, LeadsIcon, SettingsIcon, SparklesIcon, CampaignsIcon, CallLogsIcon, DocumentsIcon, TeamIcon, ChevronDownIcon, ShieldIcon, XIcon } from './icons';
import { User } from '../types';
import { logoDataURI } from '../data/logo';

interface SidebarProps {
    currentPage: string;
    setCurrentPage: (page: string) => void;
    user: User;
    onLogout: () => void;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, user, onLogout, onClose }) => {
    const navItems = [
        { icon: DashboardIcon, label: 'Dashboard', page: 'Dashboard' },
        { icon: LeadsIcon, label: 'Leads', page: 'Leads' },
        { icon: CampaignsIcon, label: 'Campaigns', page: 'Campaigns' },
        { icon: CallLogsIcon, label: 'Call Logs', page: 'CallLogs' },
        { icon: SparklesIcon, label: 'Your Ai', page: 'YourAi' },
        { icon: DocumentsIcon, label: 'Documents', page: 'Documents' },
        { icon: TeamIcon, label: 'Team', page: 'Team' },
    ];

    return (
        <div className="w-64 bg-white dark:bg-gray-800 text-gray-800 dark:text-white flex flex-col flex-shrink-0 border-r border-gray-200 dark:border-gray-700" data-testid="sidebar-container">
            <div className="flex items-center justify-between px-4 h-20 border-b border-gray-200 dark:border-gray-700">
                <img src={logoDataURI} alt="AILEADIQ Logo" className="h-12 w-auto" />
                <button 
                    onClick={onClose} 
                    className="md:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    aria-label="Close sidebar"
                    data-testid="sidebar-button-close"
                >
                    <XIcon className="h-6 w-6" />
                </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map((item) => (
                    <a
                        key={item.page}
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(item.page);
                        }}
                        className={`flex items-center px-4 py-1.5 rounded-lg transition-colors duration-200 ${
                            currentPage === item.page
                                ? 'bg-indigo-500 text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white'
                        }`}
                        data-testid={`sidebar-navlink-${item.label.toLowerCase().replace(' ', '-')}`}
                    >
                        <item.icon className="h-6 w-6 mr-3" />
                        <span className="font-medium">{item.label}</span>
                    </a>
                ))}
                {user.isAdmin && (
                    <a
                        key="InternalAdmin"
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage('InternalAdmin');
                        }}
                        className={`flex items-center px-4 py-1.5 rounded-lg transition-colors duration-200 ${
                            currentPage === 'InternalAdmin'
                                ? 'bg-indigo-500 text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white'
                        }`}
                        data-testid="sidebar-navlink-internal-admin"
                    >
                        <ShieldIcon className="h-6 w-6 mr-3" />
                        <span className="font-medium">Internal Admin</span>
                    </a>
                )}
            </nav>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                 <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage('Settings');
                    }}
                    className={`flex items-center px-4 py-1.5 rounded-lg transition-colors duration-200 ${
                        currentPage === 'Settings'
                            ? 'bg-indigo-500 text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white'
                    }`}
                    data-testid="sidebar-navlink-settings"
                >
                    <SettingsIcon className="h-6 w-6 mr-3" />
                    <span className="font-medium">Settings</span>
                </a>

                <div data-testid="sidebar-user-profile-widget" className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                    <div className="flex items-center">
                        <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt="User Avatar"/>
                        <div className="ml-3">
                            <p className="text-sm font-semibold text-gray-800 dark:text-white">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                    </div>
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                </div>
                 <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        onLogout();
                    }}
                    className={`flex items-center px-4 py-1.5 rounded-lg transition-colors duration-200 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white`}
                    data-testid="sidebar-button-logout"
                >
                    <svg className="h-6 w-6 mr-3 transform rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium">Logout</span>
                </a>
            </div>
        </div>
    );
};

export default Sidebar;