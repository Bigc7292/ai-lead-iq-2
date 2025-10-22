import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './components/DashboardPage';
import LeadsPage from './components/LeadsPage';
import AiInsightModal from './components/AiInsightModal';
import { Lead, User, Campaign } from './types';
import { getLeadInsight } from './services/geminiService';
import LeadDetailPage from './components/LeadDetailPage';
import CampaignsPage from './components/CampaignsPage';
import CallLogsPage from './components/CallLogsPage';
import AIAssistantPage from './components/AIAssistantPage';
import WorkflowsPage from './components/WorkflowsPage';
import SettingsPage from './components/SettingsPage';
import AddLeadModal from './components/AddLeadModal';
import CreateWorkflowModal from './components/CreateWorkflowModal';
import InternalAdminPage from './components/InternalAdminPage';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import CampaignDetailPage from './components/CampaignDetailPage';
import CreateCampaignModal from './components/CreateCampaignModal';
import EditCallLogModal from './components/EditCallLogModal';
import LiveConversationPage from './components/LiveConversationPage';


const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState('Dashboard');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);
    const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
    const [isCreateWorkflowModalOpen, setIsCreateWorkflowModalOpen] = useState(false);
    const [isCreateCampaignModalOpen, setIsCreateCampaignModalOpen] = useState(false);
    const [insightLead, setInsightLead] = useState<Lead | null>(null);
    const [insightContent, setInsightContent] = useState('');
    const [isInsightLoading, setIsInsightLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Manage authentication state
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [authPage, setAuthPage] = useState<'login' | 'signup'>('login');
    const [postAuthRoot, setPostAuthRoot] = useState<HTMLElement | null>(null);

    // This effect handles hiding the landing page and showing the main app view.
    useEffect(() => {
        const preAuthView = document.getElementById('pre-auth-view');
        const postAuthView = document.getElementById('post-auth-view');

        if (currentUser) {
            if (preAuthView) preAuthView.style.display = 'none';
            if (postAuthView) {
                postAuthView.style.display = 'flex';
                postAuthView.style.height = '100vh';
                postAuthView.style.width = '100vw';
                setPostAuthRoot(postAuthView);
            }
        } else {
            // Handle logout: show landing page, hide app view
            if (preAuthView) preAuthView.style.display = 'block';
            if (postAuthView) {
                postAuthView.style.display = 'none';
                postAuthView.innerHTML = '';
            }
            setPostAuthRoot(null);
        }
    }, [currentUser]);

    useEffect(() => {
        // Close sidebar on page change for better mobile UX
        if (isSidebarOpen) {
            setIsSidebarOpen(false);
        }
    }, [currentPage, isSidebarOpen]);

    const handleLogin = (email: string) => {
        // Mock login logic
        if (email === 'toploaderagentai@gmail.com') {
            setCurrentUser({
                name: 'Platform Owner',
                email: 'toploaderagentai@gmail.com',
                avatarUrl: 'https://i.pravatar.cc/150?u=admin',
                isAdmin: true,
            });
        } else {
            setCurrentUser({
                name: 'Colin Loader',
                email: email,
                avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
                isAdmin: false,
            });
        }
        setCurrentPage('Dashboard'); // Reset to dashboard on login
    };

    const handleSignUp = (formData: { fullName: string, email: string }) => {
        // Mock signup logic
        setCurrentUser({
            name: formData.fullName,
            email: formData.email,
            avatarUrl: `https://i.pravatar.cc/150?u=${formData.email}`,
            isAdmin: false,
        });
        setCurrentPage('Dashboard'); // Reset to dashboard on signup
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setAuthPage('login'); // Default to login page on logout
    };

    const handleGetInsight = useCallback(async (lead: Lead) => {
        setInsightLead(lead);
        setIsInsightModalOpen(true);
        setIsInsightLoading(true);
        try {
            const insight = await getLeadInsight(lead);
            setInsightContent(insight);
        } catch (error) {
            console.error(error);
            setInsightContent('Failed to generate insight.');
        } finally {
            setIsInsightLoading(false);
        }
    }, []);

    const handleCloseInsightModal = useCallback(() => {
        setIsInsightModalOpen(false);
        setInsightLead(null);
        setInsightContent('');
    }, []);

    const handleViewLead = useCallback((lead: Lead) => {
        setSelectedLead(lead);
        setCurrentPage('LeadDetail');
    }, []);
    
    const handleViewCampaign = useCallback((campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setCurrentPage('CampaignDetail');
    }, []);

    const handleAddNewLead = useCallback((newLead: Omit<Lead, 'id' | 'aiScore' | 'lastContacted' | 'avatarUrl'>) => {
        console.log('New Lead Added:', newLead);
        setIsAddLeadModalOpen(false);
    }, []);
    
    const handleAddNewCampaign = useCallback((newCampaign: any) => {
        console.log('New Campaign Added:', newCampaign);
        setIsCreateCampaignModalOpen(false);
    }, []);

    const handleBackFromDetail = useCallback(() => {
        setSelectedLead(null);
        setSelectedCampaign(null);
        if (currentPage === 'LeadDetail') setCurrentPage('Leads');
        if (currentPage === 'CampaignDetail') setCurrentPage('Campaigns');
    }, [currentPage]);


    if (!currentUser) {
        if (authPage === 'signup') {
            return <SignUpPage onSignUp={handleSignUp} onSwitchToLogin={() => setAuthPage('login')} />;
        }
        return <LoginPage onLogin={handleLogin} onSwitchToSignUp={() => setAuthPage('signup')} />;
    }

    if (postAuthRoot) {
        const pageConfig: { [key: string]: { title: string; subTitle?: string; component: React.ReactNode } } = {
            'Dashboard': { title: 'Dashboard', subTitle: "Call Activity (Last 7 Days)", component: <DashboardPage onViewLead={handleViewLead} /> },
            'Leads': { title: 'Leads', subTitle: "Manage your sales leads", component: <LeadsPage onViewLead={handleViewLead} onAddLead={() => setIsAddLeadModalOpen(true)} /> },
            'Campaigns': { title: 'Campaigns', subTitle: "Manage your outreach campaigns", component: <CampaignsPage onViewCampaign={handleViewCampaign} onCreateCampaign={() => setIsCreateCampaignModalOpen(true)} /> },
            'CallLogs': { title: 'Call Logs', subTitle: "View and analyze your call history", component: <CallLogsPage /> },
            'LiveConversation': { title: 'Live AI Conversation', subTitle: "Test your AI agent with a real-time voice conversation", component: <LiveConversationPage /> },
            'AIAssistant': { title: 'AI Assistant', subTitle: "Get AI-powered help with scripts, emails, and sales strategies", component: <AIAssistantPage /> },
            'Workflows': { title: 'Workflows', subTitle: "Automate your sales processes with intelligent workflows", component: <WorkflowsPage onCreateWorkflow={() => setIsCreateWorkflowModalOpen(true)} /> },
            'Team': { title: 'Team', subTitle: "Manage your team members", component: <div className="text-white">Team Page Coming Soon</div> },
            'Documents': { title: 'Documents', subTitle: "Manage your documents", component: <div className="text-white">Documents Page Coming Soon</div> },
            'Settings': { title: 'Settings', subTitle: "Manage your company settings", component: <SettingsPage user={currentUser} /> },
            'LeadDetail': { title: 'Lead Information', subTitle: `Viewing profile for ${selectedLead?.name}`, component: selectedLead ? <LeadDetailPage lead={selectedLead} onBack={handleBackFromDetail} /> : <div/> },
            'CampaignDetail': { title: 'Campaign Performance', subTitle: `Analyzing "${selectedCampaign?.name}"`, component: selectedCampaign ? <CampaignDetailPage campaign={selectedCampaign} onBack={handleBackFromDetail} /> : <div/> },
            'InternalAdmin': { title: 'Internal Admin', subTitle: "Business-level KPIs & System Health", component: <InternalAdminPage /> },
        }

        let currentConfig = pageConfig[currentPage] || pageConfig['Dashboard'];
        let componentToRender = currentConfig.component;

        if (currentPage === 'InternalAdmin' && !currentUser.isAdmin) {
            currentConfig = pageConfig['Dashboard'];
            componentToRender = currentConfig.component;
        }

        return createPortal(
            <div className="relative md:flex md:h-screen bg-gray-50 dark:bg-gray-900 font-sans md:overflow-hidden min-h-screen w-full">
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                        aria-hidden="true"
                    ></div>
                )}
                <div className={`sidebar-wrapper ${isSidebarOpen ? 'open' : ''}`}>
                    <Sidebar 
                        currentPage={currentPage} 
                        setCurrentPage={(page) => {
                            setSelectedLead(null);
                            setSelectedCampaign(null);
                            setCurrentPage(page);
                        }}
                        user={currentUser}
                        onLogout={handleLogout}
                        onClose={() => setIsSidebarOpen(false)}
                     />
                </div>
                <div className="main-content-wrapper flex-1 flex flex-col md:overflow-hidden">
                    <Header 
                        title={currentConfig.title} 
                        subTitle={currentConfig.subTitle} 
                        onMenuClick={() => setIsSidebarOpen(true)} 
                    />
                    <main className="flex-1 overflow-x-hidden md:overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
                        {componentToRender}
                    </main>
                </div>
                {isInsightModalOpen && (
                    <AiInsightModal
                        lead={insightLead}
                        insight={insightContent}
                        isLoading={isInsightLoading}
                        onClose={handleCloseInsightModal}
                    />
                )}
                {isAddLeadModalOpen && (
                    <AddLeadModal
                        onClose={() => setIsAddLeadModalOpen(false)}
                        onAddLead={handleAddNewLead}
                    />
                )}
                {isCreateCampaignModalOpen && (
                    <CreateCampaignModal
                        onClose={() => setIsCreateCampaignModalOpen(false)}
                        onAddCampaign={handleAddNewCampaign}
                    />
                )}
                {isCreateWorkflowModalOpen && (
                    <CreateWorkflowModal
                        onClose={() => setIsCreateWorkflowModalOpen(false)}
                    />
                )}
            </div>,
            postAuthRoot
        );
    }
    
    return null; // Render nothing while waiting for the portal root to be established.
};

export default App;