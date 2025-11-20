import React, { useState } from 'react';
import { Lead, LeadStatus, LeadPriority } from '../types';
import { ChevronDownIcon } from './icons';

interface AddLeadModalProps {
    onClose: () => void;
    onAddLead: (lead: Omit<Lead, 'id' | 'aiScore' | 'lastContacted' | 'avatarUrl'>) => void;
}

const AddLeadModal: React.FC<AddLeadModalProps> = ({ onClose, onAddLead }) => {
    const [formData, setFormData] = useState({
        phone: '+1 (555) 000-0000',
        name: 'John Doe',
        email: 'john@example.com',
        company: 'Acme Corp',
        position: 'Sales Manager',
        industry: 'Technology',
        status: LeadStatus.NEW,
        priority: 'Medium' as LeadPriority,
        source: 'Website, Referral, etc.',
        notes: 'Additional notes...'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddLead(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity" data-testid="add-lead-modal-container">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl mx-4 transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Lead</h2>
                    <button onClick={onClose} data-testid="add-lead-modal-button-close" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} data-testid="add-lead-modal-form">
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                        <InputGroup label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} required data-testid="add-lead-modal-input-phone" />
                        <InputGroup label="Full Name" name="name" value={formData.name} onChange={handleChange} required data-testid="add-lead-modal-input-name" />
                        <InputGroup label="Email" name="email" type="email" value={formData.email} onChange={handleChange} data-testid="add-lead-modal-input-email" />
                        <InputGroup label="Company Name" name="company" value={formData.company} onChange={handleChange} data-testid="add-lead-modal-input-company" />
                        <InputGroup label="Position" name="position" value={formData.position} onChange={handleChange} data-testid="add-lead-modal-input-position" />
                        <InputGroup label="Industry" name="industry" value={formData.industry} onChange={handleChange} data-testid="add-lead-modal-input-industry" />
                        
                        <SelectGroup label="Status" name="status" value={formData.status} onChange={handleChange} data-testid="add-lead-modal-select-status">
                            {Object.values(LeadStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </SelectGroup>
                        
                        <SelectGroup label="Priority" name="priority" value={formData.priority} onChange={handleChange} data-testid="add-lead-modal-select-priority">
                            <option>High</option>
                            <option>Medium</option>
                            <option>Low</option>
                        </SelectGroup>

                        <div className="md:col-span-2">
                            <InputGroup label="Source" name="source" value={formData.source} onChange={handleChange} data-testid="add-lead-modal-input-source" />
                        </div>
                        <div className="md:col-span-2">
                             <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                             <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={4} data-testid="add-lead-modal-textarea-notes" className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} data-testid="add-lead-modal-button-cancel" className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
                        <button type="submit" data-testid="add-lead-modal-button-submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Create Lead</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InputGroup: React.FC<{ label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, required?: boolean, "data-testid": string }> = ({ label, name, "data-testid": dataTestId, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label} {props.required && <span className="text-red-500">*</span>}
        </label>
        <input id={name} name={name} {...props} data-testid={dataTestId} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    </div>
);

const SelectGroup: React.FC<{ label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode, "data-testid": string }> = ({ label, name, children, "data-testid": dataTestId, ...props }) => (
    <div className="relative">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <select id={name} name={name} {...props} data-testid={dataTestId} className="appearance-none mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            {children}
        </select>
        <ChevronDownIcon className="h-5 w-5 text-gray-400 absolute right-3 top-8 pointer-events-none" />
    </div>
);

export default AddLeadModal;