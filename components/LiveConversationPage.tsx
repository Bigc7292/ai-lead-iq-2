import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LiveServerMessage, Modality, LiveSession } from '@google/genai';
import { ai } from '../services/geminiService';
import { MicrophoneIcon, StopIcon, SparklesIcon, AlertIcon } from './icons';
import { decode, decodeAudioData, createBlob } from '../utils/audioUtils';

type TranscriptItem = {
    speaker: 'user' | 'ai';
    text: string;
    isPartial?: boolean;
};

const VOICE_OPTIONS = [
    { name: 'Friendly & Upbeat (Zephyr)', value: 'Zephyr' },
    { name: 'Professional & Clear (Kore)', value: 'Kore' },
    { name: 'Warm & Empathetic (Puck)', value: 'Puck' },
    { name: 'Deep & Authoritative (Charon)', value: 'Charon' },
    { name: 'Energetic & Crisp (Fenrir)', value: 'Fenrir' },
];

const LiveConversationPage: React.FC = () => {
    const [userRole, setUserRole] = useState('An interested but cautious prospect');
    const [openingPrompt, setOpeningPrompt] = useState("Hi, this is Alex from AILeadIQ. I'm calling about our autonomous sales platform. Is now a good time to talk?");
    const [voice, setVoice] = useState('Zephyr');
    const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [transcript, setTranscript] = useState<TranscriptItem[]>([]);

    const sessionPromise = useRef<Promise<LiveSession> | null>(null);
    const inputAudioContext = useRef<AudioContext | null>(null);
    const outputAudioContext = useRef<AudioContext | null>(null);
    const scriptProcessor = useRef<ScriptProcessorNode | null>(null);
    const mediaStream = useRef<MediaStream | null>(null);
    const nextStartTime = useRef(0);
    const sources = useRef(new Set<AudioBufferSourceNode>());
    const currentInputTranscription = useRef('');
    const currentOutputTranscription = useRef('');

    const handleStop = useCallback(() => {
        setStatus('idle');
        sessionPromise.current?.then(session => session.close());
        sessionPromise.current = null;

        mediaStream.current?.getTracks().forEach(track => track.stop());
        mediaStream.current = null;

        scriptProcessor.current?.disconnect();
        scriptProcessor.current = null;

        if (inputAudioContext.current?.state !== 'closed') {
            inputAudioContext.current?.close();
        }
        if (outputAudioContext.current?.state !== 'closed') {
            outputAudioContext.current?.close();
        }
    }, []);

    const handleStart = useCallback(async () => {
        setTranscript([]);
        setError(null);
        setStatus('connecting');

        if (!ai) {
            setError("AI Service not available. Check API Key.");
            setStatus('error');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStream.current = stream;
        } catch (e) {
            console.error(e);
            setError("Microphone access denied. Please allow microphone access in your browser settings.");
            setStatus('error');
            return;
        }

        inputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        nextStartTime.current = 0;
        
        const systemInstruction = `You are a helpful and friendly AI sales agent for a company called AILeadIQ. Your name is Alex. The user is role-playing as: "${userRole}". Your goal is to qualify them and book a meeting. Start the conversation with this exact line: "${openingPrompt}"`;

        sessionPromise.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
                systemInstruction,
                inputAudioTranscription: {},
                outputAudioTranscription: {},
            },
            callbacks: {
                onopen: () => {
                    setStatus('active');
                    const source = inputAudioContext.current!.createMediaStreamSource(mediaStream.current!);
                    scriptProcessor.current = inputAudioContext.current!.createScriptProcessor(4096, 1, 1);
                    scriptProcessor.current.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        sessionPromise.current?.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    source.connect(scriptProcessor.current);
                    scriptProcessor.current.connect(inputAudioContext.current!.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    // Handle transcription updates
                    if (message.serverContent?.inputTranscription) {
                        const text = message.serverContent.inputTranscription.text;
                        currentInputTranscription.current += text;
                        setTranscript(prev => {
                            const last = prev[prev.length - 1];
                            if (last?.speaker === 'user' && last.isPartial) {
                                return [...prev.slice(0, -1), { speaker: 'user', text: currentInputTranscription.current, isPartial: true }];
                            }
                            return [...prev, { speaker: 'user', text: currentInputTranscription.current, isPartial: true }];
                        });
                    } else if (message.serverContent?.outputTranscription) {
                        const text = message.serverContent.outputTranscription.text;
                        currentOutputTranscription.current += text;
                         setTranscript(prev => {
                            const last = prev[prev.length - 1];
                            if (last?.speaker === 'ai' && last.isPartial) {
                                return [...prev.slice(0, -1), { speaker: 'ai', text: currentOutputTranscription.current, isPartial: true }];
                            }
                            return [...prev, { speaker: 'ai', text: currentOutputTranscription.current, isPartial: true }];
                        });
                    }

                    if (message.serverContent?.turnComplete) {
                        setTranscript(prev => prev.map(item => item.isPartial ? { ...item, isPartial: false } : item));
                        currentInputTranscription.current = '';
                        currentOutputTranscription.current = '';
                    }

                    // Handle audio output
                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                    if (base64Audio && outputAudioContext.current) {
                        nextStartTime.current = Math.max(nextStartTime.current, outputAudioContext.current.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext.current, 24000, 1);
                        const sourceNode = outputAudioContext.current.createBufferSource();
                        sourceNode.buffer = audioBuffer;
                        sourceNode.connect(outputAudioContext.current.destination);
                        sourceNode.addEventListener('ended', () => sources.current.delete(sourceNode));
                        sourceNode.start(nextStartTime.current);
                        nextStartTime.current += audioBuffer.duration;
                        sources.current.add(sourceNode);
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error(e);
                    setError(`An error occurred: ${e.message}`);
                    handleStop();
                    setStatus('error');
                },
                onclose: () => {
                    if (status !== 'error') {
                        setStatus('idle');
                    }
                },
            },
        });

    }, [userRole, openingPrompt, voice, handleStop, status]);
    
    useEffect(() => {
        return () => { handleStop(); };
    }, [handleStop]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 self-start">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Role-Play Configuration</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="voiceTone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">AI Voice Tone</label>
                        <select id="voiceTone" value={voice} onChange={e => setVoice(e.target.value)} disabled={status !== 'idle'} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50">
                           {VOICE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="userRole" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Role</label>
                        <textarea id="userRole" rows={3} value={userRole} onChange={e => setUserRole(e.target.value)} disabled={status !== 'idle'} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50"/>
                    </div>
                    <div>
                        <label htmlFor="openingPrompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">AI's Opening Line</label>
                        <textarea id="openingPrompt" rows={4} value={openingPrompt} onChange={e => setOpeningPrompt(e.target.value)} disabled={status !== 'idle'} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50"/>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col min-h-[600px]">
                <div ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }} className="flex-1 p-6 overflow-y-auto space-y-4">
                    {transcript.length === 0 && status === 'idle' && (
                        <div className="text-center text-gray-400 dark:text-gray-500 h-full flex flex-col justify-center items-center">
                            <SparklesIcon className="h-12 w-12 mb-2" />
                            <p className="font-semibold">Your live conversation will appear here.</p>
                            <p className="text-sm">Configure your role-play and click "Start Conversation".</p>
                        </div>
                    )}
                    {transcript.map((item, index) => (
                         <div key={index} className={`flex items-start gap-3 ${item.speaker === 'user' ? 'justify-end' : ''}`}>
                            {item.speaker === 'ai' && <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0">A</div>}
                            <div className={`max-w-md p-3 rounded-lg ${item.speaker === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                                <p className="text-sm">{item.text}</p>
                            </div>
                            {item.speaker === 'user' && <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold flex-shrink-0">Y</div>}
                         </div>
                    ))}
                </div>
                
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center space-y-3">
                     {error && (
                        <div className="flex items-center text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-2 rounded-md">
                            <AlertIcon className="h-5 w-5 mr-2" /> {error}
                        </div>
                    )}
                    <div className="flex items-center space-x-4">
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 w-24 text-center capitalize">{status}</p>
                        {status === 'idle' || status === 'error' ? (
                            <button onClick={handleStart} className="flex items-center justify-center w-20 h-20 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all shadow-lg text-sm font-semibold">
                                <MicrophoneIcon className="h-8 w-8"/>
                            </button>
                        ) : (
                            <button onClick={handleStop} className="flex items-center justify-center w-20 h-20 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg text-sm font-semibold animate-pulse">
                                <StopIcon className="h-8 w-8"/>
                            </button>
                        )}
                        <div className="w-24"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveConversationPage;