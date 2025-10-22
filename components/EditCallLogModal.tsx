import React, { useState, useRef, useEffect } from 'react';
import { CallLog, CallOutcome } from '../types';
import { ChevronDownIcon, PlayIcon, PauseIcon } from './icons';

interface EditCallLogModalProps {
    log: CallLog;
    onClose: () => void;
    onSave: (log: CallLog) => void;
}

const EditCallLogModal: React.FC<EditCallLogModalProps> = ({ log, onClose, onSave }) => {
    const [outcome, setOutcome] = useState(log.outcome);
    const [notes, setNotes] = useState(log.notes);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlay = () => {
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...log, outcome, notes });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity" onClick={onClose} data-testid="edit-call-log-modal-container">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 transform transition-all flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Review & Edit Call Log</h2>
                    <button onClick={onClose} data-testid="edit-call-log-modal-button-close" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Call Details */}
                    <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                        <div>
                            <p><span className="font-medium text-gray-700 dark:text-gray-400">Lead:</span> {log.lead.name}</p>
                            <p><span className="font-medium text-gray-700 dark:text-gray-400">Direction:</span> {log.direction}</p>
                        </div>
                        <div className="text-right">
                            <p><span className="font-medium text-gray-700 dark:text-gray-400">Date:</span> {log.dateTime}</p>
                            <p><span className="font-medium text-gray-700 dark:text-gray-400">Duration:</span> {log.duration}</p>
                        </div>
                    </div>
                
                    {/* Transcript & Audio */}
                    <div className="space-y-3">
                        <h3 className="text-base font-semibold text-gray-800 dark:text-white">Call Recording & Transcript</h3>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div className="flex items-center justify-center">
                                <audio ref={audioRef} src={log.audioUrl} preload="none"></audio>
                                <button type="button" onClick={togglePlay} className="flex items-center justify-center px-4 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-colors font-medium text-sm shadow-sm">
                                    {isPlaying ? <PauseIcon className="h-5 w-5 mr-2"/> : <PlayIcon className="h-5 w-5 mr-2"/>}
                                    {isPlaying ? 'Pause Audio' : 'Play Audio'}
                                </button>
                            </div>
                            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-md max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700">
                                <pre className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap font-sans">{log.transcript || 'No transcript available.'}</pre>
                            </div>
                        </div>
                    </div>

                    {/* Editable Form */}
                    <form onSubmit={handleSubmit} id="edit-call-form" className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="relative">
                            <label htmlFor="outcome" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Call Outcome</label>
                            <select
                                id="outcome"
                                value={outcome}
                                onChange={(e) => setOutcome(e.target.value as CallOutcome)}
                                className="appearance-none mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                {Object.values(CallOutcome).map(o => (
                                    <option key={o} value={o}>{o}</option>
                                ))}
                            </select>
                            <ChevronDownIcon className="h-5 w-5 text-gray-400 absolute right-3 top-8 pointer-events-none" />
                        </div>
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                            <textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={4}
                                className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Add or edit notes for this call..."
                            />
                        </div>
                    </form>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 flex-shrink-0">
                    <button type="button" onClick={onClose} data-testid="edit-call-log-modal-button-cancel" className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
                    <button type="submit" form="edit-call-form" data-testid="edit-call-log-modal-button-submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default EditCallLogModal;