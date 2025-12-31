import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';

interface ChatPanelProps {
    history: Message[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    panelId: string;
    inputPlaceholder: string;
    submitButtonText: string;
    onStop: () => void;
}

const suggestionRegex = /(🔍\s*\[Investigation\?\]\s*🔭\s*\[Exploration\?\]\s*🎯\s*\[Exploitation\?\])$/;

const ChatPanel: React.FC<ChatPanelProps> = ({
    history,
    onSendMessage,
    isLoading,
    panelId,
    inputPlaceholder,
    submitButtonText,
    onStop,
}) => {
    const [inputValue, setInputValue] = useState('');
    const historyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (historyRef.current) {
            historyRef.current.scrollTop = historyRef.current.scrollHeight;
        }
    }, [history, isLoading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && !isLoading) {
            onSendMessage(inputValue.trim());
            setInputValue('');
        }
    };
    
    const handleSuggestionClick = (suggestion: string) => {
        if (!isLoading) {
            onSendMessage(suggestion);
        }
    }

    return (
        <div className="flex flex-col h-full p-2">
            <h2 className="section-title text-xl font-bold mb-4 px-2">Chat with AGENTX</h2>
            <div 
                id={`${panelId}-history`}
                ref={historyRef}
                className="flex-grow p-4 rounded-xl h-80 overflow-y-auto flex flex-col gap-4"
            >
                {history.map((msg, index) => {
                    const isLastMessage = index === history.length - 1;
                    const match = isLastMessage && msg.author === 'assistant' ? msg.content.match(suggestionRegex) : null;
                    const content = match ? msg.content.replace(suggestionRegex, '').trim() : msg.content;
                    const suggestions = ["Investigation?", "Exploration?", "Exploitation?"];

                    return (
                        <div
                            key={index}
                            className={`p-3 rounded-lg max-w-[90%] md:max-w-[80%] ${msg.author === 'user' ? 'user-message self-end' : 'assistant-message self-start'}`}
                        >
                            <p className="whitespace-pre-wrap text-sm">{content}</p>
                             {match && !isLoading && (
                                <div className="suggestion-buttons">
                                    <button onClick={() => handleSuggestionClick("Investigation?")}>🔍 Investigation?</button>
                                    <button onClick={() => handleSuggestionClick("Exploration?")}>🔭 Exploration?</button>
                                    <button onClick={() => handleSuggestionClick("Exploitation?")}>🎯 Exploitation?</button>
                                </div>
                            )}
                        </div>
                    );
                })}
                 {isLoading && (
                    <div className="p-3 rounded-lg max-w-[90%] assistant-message self-start">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                           <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></div>
                           <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
                        </div>
                    </div>
                )}
            </div>
            <form onSubmit={handleSubmit} className="mt-4 flex gap-2 p-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isLoading}
                    id={`${panelId}-input`}
                    className="flex-grow rounded-full p-3 bg-[color:var(--card-bg-color)] border border-[color:var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-color)] text-sm"
                    placeholder={inputPlaceholder}
                    autoComplete="off"
                />
                 {isLoading ? (
                    <button
                        type="button"
                        onClick={onStop}
                        className="text-white rounded-full px-5 font-bold transition-all bg-red-600 hover:bg-red-700"
                        title="Stop autonomous process"
                    >
                        Stop
                    </button>
                ) : (
                    <button
                        type="submit"
                        id={`${panelId}-submit`}
                        disabled={isLoading}
                        className={`text-white rounded-full px-5 font-bold transition-all bg-[color:var(--primary-color)] hover:bg-[color:var(--primary-hover-color)]`}
                    >
                        {submitButtonText}
                    </button>
                )}
            </form>
        </div>
    );
};

export default ChatPanel;