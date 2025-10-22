import React from 'react';
import { SparklesIcon, MenuIcon } from './icons';
import { logoDataURI } from '../data/logo';

interface HeaderProps {
    title: string;
    subTitle?: string;
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, subTitle, onMenuClick }) => {
    return (
        <header className="bg-white dark:bg-gray-800 h-24 flex items-center justify-between px-4 md:px-8 flex-shrink-0 border-b border-gray-200 dark:border-gray-700" data-testid="header-container">
            <div className="flex items-center">
                <button
                    onClick={onMenuClick}
                    className="md:hidden mr-4 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                    aria-label="Open sidebar"
                    data-testid="header-button-menu"
                >
                    <MenuIcon className="h-6 w-6" />
                </button>
                 
                {/* Mobile Logo & Brand */}
                <div className="flex items-center md:hidden">
                     <img src={logoDataURI} alt="AILEADIQ Logo" className="h-10 w-auto" />
                </div>

                {/* Desktop Title */}
                 <h1 className="hidden md:flex text-2xl md:text-3xl font-bold text-gray-800 dark:text-white items-center" data-testid="header-text-title">
                    <span className="p-2 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 rounded-lg mr-2 md:mr-4">
                        <SparklesIcon className="h-6 w-6 md:h-7 md:w-7 text-indigo-500" />
                    </span>
                    {title}
                </h1>
            </div>
             <div>
                {subTitle && <p className="text-gray-500 mt-1 hidden md:block">{subTitle}</p>}
             </div>
        </header>
    );
};

export default Header;