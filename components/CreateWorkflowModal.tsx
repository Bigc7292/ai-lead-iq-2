import React, { useState, useRef, useCallback, DragEvent, MouseEvent, useEffect } from 'react';
import { PhoneIcon, MailIcon, BranchIcon, TriggerIcon, CheckCircleIcon, MessageIcon, ClipboardListIcon, ChevronDownIcon, SocialMediaIcon, ZoomInIcon, ZoomOutIcon, ClockIcon, TagIcon, WebhookIcon, AlertIcon } from './icons';

interface CreateWorkflowModalProps {
    onClose: () => void;
}

// --- TYPES ---
interface NodeData {
    title: string;
    [key: string]: any;
}

interface WorkflowNode {
    id: string;
    type: keyof typeof nodeTypes;
    position: { x: number; y: number };
    data: NodeData;
}

interface Connection {
    from: string;
    to: string;
}


// --- NODE CONFIGURATION ---
const nodeTypes = {
    socialMediaTrigger: { icon: SocialMediaIcon, title: 'Social Media Lead', category: 'Triggers' },
    newLeadTrigger: { icon: TriggerIcon, title: 'New Lead Created', category: 'Triggers' },
    aiCall: { icon: PhoneIcon, title: 'AI Call', category: 'Actions' },
    sendEmail: { icon: MailIcon, title: 'Send Email', category: 'Actions' },
    sendSms: { icon: MessageIcon, title: 'Send SMS', category: 'Actions' },
    updateLead: { icon: ClipboardListIcon, title: 'Update Lead', category: 'Actions' },
    tagLead: { icon: TagIcon, title: 'Tag Lead', category: 'Actions' },
    callWebhook: { icon: WebhookIcon, title: 'Call Webhook', category: 'Actions' },
    decision: { icon: BranchIcon, title: 'Decision / If-Else', category: 'Logic' },
    wait: { icon: ClockIcon, title: 'Wait / Delay', category: 'Logic' },
    end: { icon: CheckCircleIcon, title: 'End Workflow', category: 'Logic' },
};


// --- DRAGGABLE PALETTE NODE ---
const PaletteNode: React.FC<{ type: keyof typeof nodeTypes }> = ({ type }) => {
    const config = nodeTypes[type];
    const onDragStart = (e: DragEvent) => {
        e.dataTransfer.setData('application/workflow-node-type', type);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div
            draggable
            onDragStart={onDragStart}
            className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 shadow-sm flex items-center space-x-3 cursor-grab hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500 transition-all mb-2"
        >
            <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 rounded-md p-2">
                <config.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-gray-800 dark:text-white truncate">{config.title}</h4>
            </div>
        </div>
    );
};

// --- CANVAS NODE ---
const CanvasNode: React.FC<{
    node: WorkflowNode;
    onNodeDataChange: (id: string, data: Partial<NodeData>) => void;
    editingNodeId: string | null;
    setEditingNodeId: (id: string | null) => void;
    onConnectionStart: (e: MouseEvent, nodeId: string) => void;
    onConnectionEnd: (e: MouseEvent, nodeId: string) => void;
}> = ({ node, onNodeDataChange, editingNodeId, setEditingNodeId, onConnectionStart, onConnectionEnd }) => {
    const config = nodeTypes[node.type];
    const isEditing = editingNodeId === node.id;
    const [isExpanded, setIsExpanded] = useState(false);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onNodeDataChange(node.id, { title: e.target.value });
    };
    
    const handleDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        onNodeDataChange(node.id, { [e.target.name]: e.target.value });
    };
    
    const renderNodeContent = () => {
        if (!isExpanded) return null;
        
        const contentMap: { [key: string]: React.ReactNode } = {
          aiCall: (
            <>
              <ConfigSelect label="Voice" name="voice" value={node.data.voice || 'Aria (Female)'} onChange={handleDataChange} options={['Aria (Female)', 'Leo (Male)', 'Zoe (Female)']} />
              <ConfigSelect label="Script" name="script" value={node.data.script || 'Initial Outreach'} onChange={handleDataChange} options={['Initial Outreach', 'Product Demo Script', 'Follow-up Script']} />
            </>
          ),
          sendEmail: (
            <>
              <ConfigInput label="Subject" name="subject" value={node.data.subject || ''} onChange={handleDataChange} placeholder="Email Subject" />
              <ConfigTextarea label="Body" name="body" value={node.data.body || ''} onChange={handleDataChange} placeholder="Email body..." />
            </>
          ),
          sendSms: <ConfigTextarea label="Message" name="message" value={node.data.message || ''} onChange={handleDataChange} placeholder="SMS message..." />,
          updateLead: (
            <>
              <ConfigSelect label="Field to Update" name="field" value={node.data.field || 'Status'} onChange={handleDataChange} options={['Status', 'Priority', 'Owner']} />
              <ConfigInput label="New Value" name="value" value={node.data.value || ''} onChange={handleDataChange} placeholder="Enter new value" />
            </>
          ),
          tagLead: <ConfigInput label="Tag Name" name="tag" value={node.data.tag || ''} onChange={handleDataChange} placeholder="e.g., hot-lead" />,
          callWebhook: <ConfigInput label="Webhook URL" name="url" value={node.data.url || ''} onChange={handleDataChange} placeholder="https://example.com/hook" />,
          wait: (
            <div className="flex items-end space-x-2">
              <ConfigInput label="Wait for" name="duration" type="number" value={node.data.duration || '5'} onChange={handleDataChange} />
              <ConfigSelect name="unit" value={node.data.unit || 'minutes'} onChange={handleDataChange} options={['minutes', 'hours', 'days']} />
            </div>
          ),
        };
        const content = contentMap[node.type];
        return content ? <div className="mt-3 space-y-2 text-xs p-1">{content}</div> : null;
    }


    return (
         <div 
            className="w-72 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 shadow-md flex flex-col cursor-grab"
            data-testid={`canvas-node-${node.id}`}
        >
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 rounded-md p-2">
                    <config.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <input
                            type="text" value={node.data.title} onChange={handleTitleChange}
                            onBlur={() => setEditingNodeId(null)}
                            onKeyDown={(e) => { if (e.key === 'Enter') setEditingNodeId(null); }}
                            className="font-semibold text-sm text-gray-800 dark:text-white bg-transparent border-b-2 border-indigo-500 focus:outline-none w-full"
                            autoFocus
                        />
                    ) : (
                        <h4 onDoubleClick={() => setEditingNodeId(node.id)} className="font-semibold text-sm text-gray-800 dark:text-white truncate" title="Double-click to edit">
                            {node.data.title}
                        </h4>
                    )}
                </div>
                <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <ChevronDownIcon className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
            </div>
            {renderNodeContent()}
            <div 
                className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-gray-500 border-2 border-indigo-500 rounded-full cursor-crosshair"
                onMouseUp={(e) => onConnectionEnd(e, node.id)}
            />
            <div 
                className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-gray-500 border-2 border-indigo-500 rounded-full cursor-crosshair"
                onMouseDown={(e) => onConnectionStart(e, node.id)}
            />
        </div>
    );
};

// --- CONFIGURATION INPUTS ---
const ConfigInput: React.FC<any> = ({ label, ...props }) => (
    <div>
      {label && <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{label}</label>}
      <input {...props} className="w-full p-1.5 text-sm bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-600 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
    </div>
);
  
const ConfigTextarea: React.FC<any> = ({ label, ...props }) => (
    <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{label}</label>
        <textarea {...props} rows={3} className="w-full p-1.5 text-sm bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-600 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
    </div>
);
  
const ConfigSelect: React.FC<any> = ({ label, options, ...props }) => (
    <div>
      {label && <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{label}</label>}
      <select {...props} className="w-full p-1.5 text-sm bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-600 focus:ring-1 focus:ring-indigo-500 focus:outline-none">
        {options.map((opt: string) => <option key={opt}>{opt}</option>)}
      </select>
    </div>
);

const CreateWorkflowModal: React.FC<CreateWorkflowModalProps> = ({ onClose }) => {
    const [scale, setScale] = useState(1);
    const [nodes, setNodes] = useState<WorkflowNode[]>([
        { id: 'start-node', type: 'socialMediaTrigger', position: { x: 50, y: 150 }, data: { title: 'Social Media Lead' } },
        { id: 'ai-call-node', type: 'aiCall', position: { x: 400, y: 150 }, data: { title: 'AI Call', voice: 'Aria (Female)', script: 'Initial Outreach' } }
    ]);
    const [connections, setConnections] = useState<Connection[]>([{ from: 'start-node', to: 'ai-call-node' }]);
    const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

    const canvasRef = useRef<HTMLDivElement>(null);
    const dragOffsetRef = useRef({ x: 0, y: 0 });
    const [draggingConnection, setDraggingConnection] = useState<{ from: string; toPoint: { x: number, y: number } } | null>(null);

    const handleNodeDataChange = useCallback((id: string, data: Partial<NodeData>) => {
        setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n));
    }, []);

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        if (!canvasRef.current) return;

        const canvasBounds = canvasRef.current.getBoundingClientRect();
        const nodeType = e.dataTransfer.getData('application/workflow-node-type') as keyof typeof nodeTypes;
        const draggedNodeId = e.dataTransfer.getData('application/node-id');

        const position = {
            x: (e.clientX - canvasBounds.left) / scale - dragOffsetRef.current.x,
            y: (e.clientY - canvasBounds.top) / scale - dragOffsetRef.current.y,
        };

        if (nodeType) { // Dropping new node from palette
            const config = nodeTypes[nodeType];
            const newNode: WorkflowNode = { id: `node_${+new Date()}`, type: nodeType, position, data: { title: config.title } };
            setNodes(nds => nds.concat(newNode));
        } else if (draggedNodeId) { // Moving existing node
            setNodes(nds => nds.map(node => node.id === draggedNodeId ? { ...node, position } : node));
        }
    };
    
    const onNodeDragStart = (e: DragEvent, node: WorkflowNode) => {
        e.dataTransfer.setData('application/node-id', node.id);
        e.dataTransfer.effectAllowed = 'move';
        const nodeElement = e.currentTarget as HTMLDivElement;
        const nodeBounds = nodeElement.getBoundingClientRect();
        dragOffsetRef.current = {
            x: (e.clientX - nodeBounds.left) / scale,
            y: (e.clientY - nodeBounds.top) / scale,
        };
    };

    const handleConnectionStart = (e: MouseEvent, fromNodeId: string) => {
        e.stopPropagation();
        setDraggingConnection({ from: fromNodeId, toPoint: { x: e.clientX, y: e.clientY } });
    };

    const handleConnectionEnd = (e: MouseEvent, toNodeId: string) => {
        e.stopPropagation();
        if (draggingConnection) {
            setConnections(conns => [...conns, { from: draggingConnection.from, to: toNodeId }]);
        }
        setDraggingConnection(null);
    };

    const handleCanvasMouseMove = (e: MouseEvent) => {
        if (draggingConnection) {
            setDraggingConnection({ ...draggingConnection, toPoint: { x: e.clientX, y: e.clientY } });
        }
    };
    
    const handleCanvasMouseUp = () => {
        setDraggingConnection(null);
    };
    
    const getHandlePosition = (nodeId: string, type: 'in' | 'out') => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node || !canvasRef.current) return { x: 0, y: 0 };
        const canvasBounds = canvasRef.current.getBoundingClientRect();
        const x = (node.position.x + (type === 'out' ? 288 : 0));
        const y = (node.position.y + 36); // Center of the node vertically
        return { x, y };
    };

    const triggerNodeTypes = Object.entries(nodeTypes).filter(([, v]) => v.category === 'Triggers').map(([k]) => k as keyof typeof nodeTypes);
    const actionNodeTypes = Object.entries(nodeTypes).filter(([, v]) => v.category === 'Actions').map(([k]) => k as keyof typeof nodeTypes);
    const logicNodeTypes = Object.entries(nodeTypes).filter(([, v]) => v.category === 'Logic').map(([k]) => k as keyof typeof nodeTypes);


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity" data-testid="create-workflow-modal-container" onClick={onClose}>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-7xl h-[90vh] mx-4 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                    <input type="text" defaultValue="New Lead Qualification Workflow" className="text-xl font-bold text-gray-900 dark:text-white bg-transparent focus:outline-none p-1 -ml-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 w-auto"/>
                    <button onClick={onClose} data-testid="create-workflow-modal-button-save" className="px-5 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Publish</button>
                </div>
                <div className="flex-1 flex overflow-hidden">
                    <aside className="flex-shrink-0 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 space-y-4 overflow-y-auto z-20" data-testid="create-workflow-modal-palette-nodes">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Triggers</h3>
                            {triggerNodeTypes.map(type => <PaletteNode key={type} type={type} />)}
                        </div>
                         <div>
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Actions</h3>
                            {actionNodeTypes.map(type => <PaletteNode key={type} type={type} />)}
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Logic</h3>
                            {logicNodeTypes.map(type => <PaletteNode key={type} type={type} />)}
                        </div>
                    </aside>

                    <main
                        ref={canvasRef}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseUp={handleCanvasMouseUp}
                        className="flex-1 bg-gray-100 dark:bg-gray-900/50 p-4 relative overflow-auto"
                        data-testid="create-workflow-modal-canvas"
                    >
                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #d1d5db88 1px, transparent 0)' , backgroundSize: '20px 20px'}}></div>
                        
                        <div className="relative w-full h-full transform-origin-top-left" style={{ transform: `scale(${scale})`}}>
                            <svg className="absolute w-full h-full overflow-visible pointer-events-none" style={{ left: 0, top: 0 }}>
                                <defs>
                                    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#9ca3af" />
                                    </marker>
                                </defs>
                                {connections.map(({ from, to }) => {
                                    const fromPos = getHandlePosition(from, 'out');
                                    const toPos = getHandlePosition(to, 'in');
                                    const d = `M ${fromPos.x} ${fromPos.y} C ${fromPos.x + 100} ${fromPos.y}, ${toPos.x - 100} ${toPos.y}, ${toPos.x} ${toPos.y}`;
                                    return <path key={`${from}-${to}`} d={d} stroke="#9ca3af" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />;
                                })}
                                {draggingConnection && (() => {
                                    if(!canvasRef.current) return null;
                                    const fromPos = getHandlePosition(draggingConnection.from, 'out');
                                    const canvasBounds = canvasRef.current.getBoundingClientRect();
                                    const toPos = {
                                        x: (draggingConnection.toPoint.x - canvasBounds.left) / scale,
                                        y: (draggingConnection.toPoint.y - canvasBounds.top) / scale
                                    };
                                    const d = `M ${fromPos.x} ${fromPos.y} C ${fromPos.x + 100} ${fromPos.y}, ${toPos.x - 100} ${toPos.y}, ${toPos.x} ${toPos.y}`;
                                    return <path d={d} stroke="#6366f1" strokeWidth="2" fill="none" strokeDasharray="5,5" />;
                                })()}
                            </svg>

                            {nodes.map(node => (
                                <div
                                    key={node.id}
                                    draggable
                                    onDragStart={(e) => onNodeDragStart(e, node)}
                                    className="absolute"
                                    style={{ left: node.position.x, top: node.position.y }}
                                >
                                    <CanvasNode 
                                        node={node} 
                                        onNodeDataChange={handleNodeDataChange}
                                        editingNodeId={editingNodeId}
                                        setEditingNodeId={setEditingNodeId}
                                        onConnectionStart={handleConnectionStart}
                                        onConnectionEnd={handleConnectionEnd}
                                    />
                                </div>
                            ))}
                        </div>
                        
                        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-700 rounded-lg shadow-lg flex items-center p-1 border border-gray-200 dark:border-gray-600 z-30">
                            <button onClick={() => setScale(s => Math.max(0.2, s - 0.1))} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md"><ZoomOutIcon className="h-5 w-5"/></button>
                            <span className="w-16 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">{Math.round(scale * 100)}%</span>
                            <button onClick={() => setScale(s => Math.min(2, s + 0.1))} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md"><ZoomInIcon className="h-5 w-5"/></button>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default CreateWorkflowModal;