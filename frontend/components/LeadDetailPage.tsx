import React, { useState, useRef, useEffect } from 'react';
import { Lead, CallLog, CallOutcome, LeadStatus } from '../types';
import { ArrowLeftIcon, PhoneIcon, MailIcon, PlayIcon, PauseIcon, ChevronDownIcon, ArrowRightIcon } from './icons';
import { mockCallLogs } from '../data/mockData';

const statusColorMap: { [key in LeadStatus]: { bg: string, text: string } } = {
    [LeadStatus.NEW]: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-800 dark:text-blue-300' },
    [LeadStatus.CONTACTED]: { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-800 dark:text-yellow-300' },
    [LeadStatus.QUALIFIED]: { bg: 'bg-cyan-100 dark:bg-cyan-900/50', text: 'text-cyan-800 dark:text-cyan-300' },
    [LeadStatus.INTERESTED]: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-800 dark:text-green-300' },
    [LeadStatus.CONVERTED]: { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-800 dark:text-purple-300' },
    [LeadStatus.NOT_INTERESTED]: { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-800 dark:text-red-300' },
};

const priorityColorMap: { [key in Lead['priority']]: { bg: string, text: string } } = {
    'High': { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-800 dark:text-red-300' },
    'Medium': { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-800 dark:text-yellow-300' },
    'Low': { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-800 dark:text-green-300' },
};

const outcomeColors: { [key in CallOutcome]: string } = {
    [CallOutcome.NO_ANSWER]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    [CallOutcome.INTERESTED]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    [CallOutcome.NOT_INTERESTED]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    [CallOutcome.CALLBACK_REQUESTED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    [CallOutcome.MEETING_BOOKED]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
};

const CallHistoryItem: React.FC<{ log: CallLog }> = ({ log }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isTranscriptVisible, setIsTranscriptVisible] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onEnded = () => setIsPlaying(false);

        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('ended', onEnded);

        return () => {
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('ended', onEnded);
        };
    }, []);

    const togglePlay = () => {
        if (audioRef.current?.paused) {
            audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
        } else {
            audioRef.current?.pause();
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700" data-testid={`lead-detail-call-item-container-${log.id}`}>
            <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${log.direction === 'Inbound' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-blue-100 dark:bg-blue-900/50'}`}>
                    {log.direction === 'Inbound'
                        ? <ArrowLeftIcon className="h-5 w-5 text-green-600 dark:text-green-300" />
                        : <ArrowRightIcon className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                    }
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold text-gray-800 dark:text-white">{log.direction} Call</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{log.dateTime}</p>
                    </div>
                    <div className="flex items-center space-x-3 mt-2 text-sm">
                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${outcomeColors[log.outcome]}`}>
                            {log.outcome}
                        </span>
                        <span>Duration: <span className="font-medium">{log.duration}</span></span>
                        {log.cost && <span>Cost: <span className="font-medium">${log.cost.toFixed(2)}</span></span>}
                    </div>
                     <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 italic">{log.notes}</p>
                </div>
            </div>
             <div className="mt-3 flex justify-end space-x-2">
                 <audio ref={audioRef} src={log.audioUrl} preload="none"></audio>
                <button onClick={togglePlay} data-testid={`lead-detail-call-item-button-play-${log.id}`} className="flex items-center px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 font-medium text-gray-700 dark:text-gray-200">
                    {isPlaying ? <PauseIcon className="h-4 w-4 mr-2" /> : <PlayIcon className="h-4 w-4 mr-2" />}
                    {isPlaying ? 'Pause' : 'Play Audio'}
                </button>
                <button onClick={() => setIsTranscriptVisible(!isTranscriptVisible)} data-testid={`lead-detail-call-item-button-transcript-${log.id}`} className="flex items-center px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 font-medium text-gray-700 dark:text-gray-200">
                    <ChevronDownIcon className={`h-4 w-4 mr-2 transition-transform ${isTranscriptVisible ? 'rotate-180' : ''}`} />
                    View Transcript
                </button>
            </div>
            {isTranscriptVisible && (
                 <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg max-h-60 overflow-y-auto" data-testid={`lead-detail-call-item-transcript-content-${log.id}`}>
                    <h4 className="font-semibold text-sm text-gray-800 dark:text-white mb-2">Transcript</h4>
                    <pre className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap font-sans">{log.transcript}</pre>
                </div>
            )}
        </div>
    );
};

interface LeadDetailPageProps {
    lead: Lead;
    onBack: () => void;
}

const LeadDetailPage: React.FC<LeadDetailPageProps> = ({ lead, onBack }) => {
    const statusColors = statusColorMap[lead.status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    const priorityColors = priorityColorMap[lead.priority] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    const leadCallHistory = mockCallLogs.filter(log => log.lead.id === lead.id);

    return (
        <div className="space-y-6" data-testid="lead-detail-page-container">
            <div className="flex justify-between items-center">
                 <button onClick={onBack} data-testid="lead-detail-button-back" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold">
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Back to Leads
                </button>
                 <button data-testid="lead-detail-button-edit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold">
                    Edit Lead
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700" data-testid="lead-detail-panel-info-and-history">
                    <div className="flex items-center space-x-2 mb-4">
                        <PhoneIcon className="h-6 w-6 text-gray-500" />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Lead Information</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
                        <InfoItem label="Full Name" value={lead.name} data-testid="lead-detail-info-item-name" />
                        <InfoItem label="Phone Number" value={lead.phone} data-testid="lead-detail-info-item-phone" />
                        <InfoItem label="Email" value={lead.email} data-testid="lead-detail-info-item-email" />
                        <InfoItem label="Company" value={lead.company} data-testid="lead-detail-info-item-company" />
                        <InfoItem label="Position" value={lead.position} data-testid="lead-detail-info-item-position" />
                        <InfoItem label="Industry" value={lead.industry} data-testid="lead-detail-info-item-industry" />
                        <div data-testid="lead-detail-info-item-status">
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Status</p>
                            <p className={`mt-1 inline-block px-3 py-1 text-xs font-semibold rounded-md ${statusColors.bg} ${statusColors.text}`}>{lead.status}</p>
                        </div>
                         <div data-testid="lead-detail-info-item-priority">
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Priority</p>
                            <p className={`mt-1 inline-block px-3 py-1 text-xs font-semibold rounded-md ${priorityColors.bg} ${priorityColors.text}`}>{lead.priority} priority</p>
                        </div>
                        <InfoItem label="Source" value={lead.source} data-testid="lead-detail-info-item-source" />
                        <div className="md:col-span-2" data-testid="lead-detail-info-item-notes">
                             <p className="text-gray-500 dark:text-gray-400 font-medium">Notes</p>
                             <p className="text-gray-800 dark:text-gray-200 mt-1">{lead.notes}</p>
                        </div>
                    </div>
                    
                    <div className="mt-8" data-testid="lead-detail-container-call-history">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Call History ({leadCallHistory.length})</h3>
                        {leadCallHistory.length > 0 ? (
                            <div className="space-y-4">
                                {leadCallHistory.map(log => <CallHistoryItem key={log.id} log={log} />)}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-8 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                <p>No call history available for this lead.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebars */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700" data-testid="lead-detail-panel-quick-stats">
                        <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-4">Quick Stats</h3>
                        <div className="space-y-3 text-sm">
                            <StatItem label="Total Calls" value={leadCallHistory.length.toString()} />
                            <StatItem label="Total Call Time" value="21 min" />
                            <StatItem label="Last Contact" value={lead.lastContacted} />
                            <StatItem label="Created Date" value="Oct 19, 2025" />
                        </div>
                    </div>
                     <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700" data-testid="lead-detail-panel-quick-actions">
                        <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button data-testid="lead-detail-action-button-call" className="w-full flex items-center justify-center px-4 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-semibold">
                                <PhoneIcon className="h-5 w-5 mr-2" />
                                Call Lead
                            </button>
                            <button data-testid="lead-detail-action-button-email" className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-semibold">
                                <MailIcon className="h-5 w-5 mr-2" />
                                Send Email
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoItem: React.FC<{ label: string; value: string, "data-testid": string }> = ({ label, value, "data-testid": dataTestId }) => (
    <div data-testid={dataTestId}>
        <p className="text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        <p className="text-gray-800 dark:text-gray-200 font-semibold mt-1">{value}</p>
    </div>
);

const StatItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex justify-between items-center">
        <span className="text-gray-500 dark:text-gray-400">{label}</span>
        <span className="font-bold text-gray-800 dark:text-white">{value}</span>
    </div>
);

export default LeadDetailPage;