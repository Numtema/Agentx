import React from 'react';
import { DownloadIcon, ThemeIcon, DocsIcon } from './icons';

interface HeaderProps {
    onDownloadScaffold: () => void;
    onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ onDownloadScaffold, onToggleTheme }) => {
    return (
        <div className="flex justify-between items-center mb-2 flex-shrink-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-3 text-[color:var(--text-color)]">
                <DocsIcon className="w-8 h-8 text-[color:var(--primary-color)]"/>
                <span>AGENTX: DocGen</span>
            </h1>
            <div className="flex items-center gap-2 sm:gap-4">
                <button 
                    onClick={onDownloadScaffold} 
                    className="flex items-center gap-2 bg-[color:var(--primary-color)] text-white font-bold py-2 px-4 rounded-full hover:bg-[color:var(--primary-hover-color)] transition-colors"
                    title="Download Scaffold as .zip"
                >
                    <DownloadIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Download Scaffold</span>
                </button>
                <button onClick={onToggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <ThemeIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default Header;