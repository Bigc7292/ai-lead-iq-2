import React from 'react';

const KpiCard: React.FC<{ title: string; value: string; change: string; changeType: 'increase' | 'decrease', "data-testid": string }> = ({ title, value, change, changeType, "data-testid": dataTestId }) => {
    const isIncrease = changeType === 'increase';
    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700" data-testid={dataTestId}>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
            <div className={`flex items-center mt-2 text-sm ${isIncrease ? 'text-green-500' : 'text-red-500'}`}>
                {isIncrease ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17l-5-5m0 0l5-5m-5 5h12" />
                    </svg>
                )}
                <span>{change}</span>
            </div>
        </div>
    );
};

export default KpiCard;
