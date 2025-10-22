import React, { useState } from 'react';
import { SparklesIcon } from './icons';
import { logoDataURI } from '../data/logo';

interface LoginPageProps {
    onLogin: (email: string) => void;
    onSwitchToSignUp: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSwitchToSignUp }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email === '' || password === '') {
            setError('Please enter email and password.');
            return;
        }
        setError('');
        // A simple check for demo purposes
        if ((email === 'toploaderagentai@gmail.com' || email === 'colinloader061@gmail.com') && password === 'password123') {
             onLogin(email);
        } else {
            setError('Invalid credentials. Hint: use password "password123" for demo accounts.');
        }
    };

    return (
        <>
            <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                    <img src={logoDataURI} alt="AILEADIQ Logo" className="h-24 w-auto" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sign in to your account</h2>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit} data-testid="login-form">
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <div className="rounded-md shadow-sm -space-y-px">
                    <div>
                        <label htmlFor="email-address" className="sr-only">Email address</label>
                        <input
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Email address (e.g., toploaderagentai@gmail.com)"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            data-testid="login-input-email"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Password (e.g., password123)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            data-testid="login-input-password"
                        />
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        data-testid="login-button-submit"
                    >
                        Sign in
                    </button>
                </div>
            </form>
            <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <button onClick={onSwitchToSignUp} data-testid="login-button-switch-to-signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Sign Up
                </button>
            </p>
        </>
    );
};

export default LoginPage;