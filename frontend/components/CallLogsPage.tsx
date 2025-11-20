import React, { useState, useRef, useEffect } from 'react';
import { CallLog, CallOutcome } from '../types';
import { mockCallLogs } from '../data/mockData';
import { ChevronDownIcon, PlayIcon, PauseIcon, PhoneIcon } from './icons';
import EditCallLogModal from './EditCallLogModal';

const outcomeColors: { [key in CallOutcome]: string } = {
    [CallOutcome.NO_ANSWER]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    [CallOutcome.INTERESTED]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    [CallOutcome.NOT_INTERESTED]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    [CallOutcome.CALLBACK_REQUESTED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    [CallOutcome.MEETING_BOOKED]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
};

const CallLogItem: React.FC<{ log: CallLog, onEdit: (log: CallLog) => void }> = ({ log, onEdit }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (audioRef.current?.paused) {
            audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
        } else {
            audioRef.current?.pause();
        }
    };

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

    const transcriptSnippet = log.transcript ? log.transcript.split('\n')[0].substring(0, 100) + (log.transcript.length > 100 ? '...' : '') : 'No transcript available.';

    return (
        <div 
            onClick={() => onEdit(log)}
            className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
            data-testid={`call-logs-item-container-${log.id}`}>
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                    <img className="w-12 h-12 rounded-full" src={log.lead.avatarUrl} alt={log.lead.name} />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 data-testid={`call-logs-item-lead-name-${log.id}`} className="text-lg font-bold text-gray-800 dark:text-white">{log.lead.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{log.lead.company}</p>
                        </div>
                         <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                <span>{log.direction}</span>
                                <span data-testid={`call-logs-item-outcome-badge-${log.id}`} className={`px-2.5 py-1 text-xs font-semibold rounded-full ${outcomeColors[log.outcome]}`}>
                                    {log.outcome}
                                </span>
                            </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        <span>{log.duration}</span> &bull; <span>{log.dateTime}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 italic">"{transcriptSnippet}"</p>
                    {log.notes && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2"><b>Notes:</b> {log.notes}</p>}
                </div>
            </div>
            <div className="flex items-center justify-end space-x-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <audio ref={audioRef} src={log.audioUrl} preload="none"></audio>
                <button onClick={togglePlay} className="flex items-center justify-center px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm">
                    {isPlaying ? <PauseIcon className="h-4 w-4 mr-2"/> : <PlayIcon className="h-4 w-4 mr-2"/>}
                    {isPlaying ? 'Pause' : 'Play'}
                </button>
            </div>
        </div>
    );
};

const CallLogsPage: React.FC = () => {
    const [logs, setLogs] = useState<CallLog[]>(mockCallLogs);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');
    const [editingLog, setEditingLog] = useState<CallLog | null>(null);
    const [isTestPanelOpen, setIsTestPanelOpen] = useState(false);

    const handleSaveLog = (updatedLog: CallLog) => {
        setLogs(logs.map(log => log.id === updatedLog.id ? updatedLog : log));
        setEditingLog(null);
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              log.lead.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'All' || log.outcome === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6" data-testid="call-logs-page-container">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setIsTestPanelOpen(!isTestPanelOpen)}
                    className="w-full flex justify-between items-center p-4 text-left font-semibold text-gray-800 dark:text-white"
                >
                    <span>System Testing & Debugging</span>
                    <ChevronDownIcon className={`h-5 w-5 transition-transform ${isTestPanelOpen ? 'rotate-180' : ''}`} />
                </button>
                {isTestPanelOpen && (
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Outbound Test */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-700 dark:text-gray-200">Outbound Call Test</h3>
                            <div>
                                <label htmlFor="testPhoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number to Call</label>
                                <input type="tel" id="testPhoneNumber" placeholder="+1 (555) 123-4567" className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="testScript" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Test Script</label>
                                <textarea id="testScript" rows={3} placeholder="Hello, this is a test call..." className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <button className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition-colors">
                                <PhoneIcon className="h-5 w-5 mr-2" />
                                Initiate AI Test Call
                            </button>
                        </div>
                        {/* Inbound Status */}
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
                )}
            </div>
            
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by lead name or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-80 pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        data-testid="call-logs-input-search"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <div className="relative">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="appearance-none w-48 pl-4 pr-10 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                        data-testid="call-logs-select-filter-outcome"
                    >
                        <option value="All">All Outcomes</option>
                        {Object.values(CallOutcome).map(outcome => (
                            <option key={outcome} value={outcome} className="capitalize">{outcome}</option>
                        ))}
                    </select>
                     <ChevronDownIcon className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
            </div>
            <div className="space-y-4" data-testid="call-logs-list-container">
                {filteredLogs.map(log => (
                    <CallLogItem key={log.id} log={log} onEdit={setEditingLog} />
                ))}
            </div>
            {editingLog && (
                <EditCallLogModal
                    log={editingLog}
                    onClose={() => setEditingLog(null)}
                    onSave={handleSaveLog}
                />
            )}
        </div>
    );
};

export default CallLogsPage;