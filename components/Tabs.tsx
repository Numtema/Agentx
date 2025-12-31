
import React from 'react';

interface TabsProps {
    activeTab: string;
    setActiveTab: (tabId: string) => void;
    tabs: { id: string; label: string; icon: string; }[];
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab, tabs }) => {
    return (
        <div className="flex justify-center flex-wrap gap-3 mb-6">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={`tab-button py-2 px-4 font-semibold transition-colors duration-300 rounded-full text-sm sm:text-base ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                >
                   {tab.icon} {tab.label}
                </button>
            ))}
        </div>
    );
};

export default Tabs;
