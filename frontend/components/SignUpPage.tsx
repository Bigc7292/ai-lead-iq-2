import React, { useState } from 'react';
import { SparklesIcon } from './icons';
import { logoDataURI } from '../data/logo';

interface SignUpPageProps {
    onSignUp: (formData: { fullName: string, email: string }) => void;
    onSwitchToLogin: () => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUp, onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        companyName: '',
        industry: 'Technology',
        teamSize: 1,
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (formData.email === 'toploaderagentai@gmail.com') {
            setError('This email is reserved for the platform owner. Please use another email or sign in.');
            return;
        }
        if (!formData.fullName || !formData.email || !formData.password || !formData.companyName) {
            setError('Please fill out all required fields.');
            return;
        }
        onSignUp(formData);
    };

    return (
        <>
            <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                    <img src={logoDataURI} alt="AILEADIQ Logo" className="h-24 w-auto" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h2>
            </div>
            <form className="mt-8 space-y-4" onSubmit={handleSubmit} data-testid="signup-form">
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required data-testid="signup-input-fullname"/>
                    <InputGroup label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} required data-testid="signup-input-companyname"/>
                </div>
                <InputGroup label="Work Email" name="email" type="email" value={formData.email} onChange={handleChange} required data-testid="signup-input-email"/>
                <InputGroup label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required data-testid="signup-input-password"/>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Industry</label>
                        <select id="industry" name="industry" value={formData.industry} onChange={handleChange} data-testid="signup-select-industry" className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option>Technology</option>
                            <option>Real Estate</option>
                            <option>Finance</option>
                            <option>Healthcare</option>
                        </select>
                    </div>
                    <InputGroup label="Team Size" name="teamSize" type="number" value={String(formData.teamSize)} onChange={handleChange} data-testid="signup-input-teamsize"/>
                </div>
                <div>
                    <button
                        type="submit"
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        data-testid="signup-button-submit"
                    >
                        Create Account
                    </button>
                </div>
            </form>
            <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <button onClick={onSwitchToLogin} data-testid="signup-button-switch-to-login" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Sign In
                </button>
            </p>
        </>
    );
};

const InputGroup: React.FC<{ label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, required?: boolean, "data-testid": string }> = ({ label, name, "data-testid": dataTestId, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label} {props.required && <span className="text-red-500">*</span>}
        </label>
        <input id={name} name={name} {...props} data-testid={dataTestId} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    </div>
);

export default SignUpPage;