import React, { useState, useEffect, useCallback, useReducer, useRef } from 'react';
import JSZip from 'jszip';
import { DocNode, AppState, LLMProvider } from './types';
import { INITIAL_STATE } from './constants';
import { documentationStructure as initialDocStructure } from './documentationData';
import { streamAgentCycle } from './services/geminiService';
import { appReducer } from './state';
import { saveAs, findNodeByPath, addNodeToZip } from './utils';
import Header from './components/Header';
import FileTree from './components/FileTree';
import FileViewer from './components/FileViewer';
import ChatPanel from './components/ChatPanel';
import AgentConfigPanel from './components/AgentConfigPanel';
import ReasoningPanel from './components/ReasoningPanel';
import Tabs from './components/Tabs';
import SettingsPanel from './components/SettingsPanel';

const App: React.FC = () => {
    const [state, dispatch] = useReducer(appReducer, {
        ...INITIAL_STATE,
        docStructure: initialDocStructure,
        isLoading: false,
    });
    const [selectedNodePath, setSelectedNodePath] = useState<string | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [activeTab, setActiveTab] = useState('chat');
    const [lastUpdatedFile, setLastUpdatedFile] = useState<string | null>(null);
    
    const isRunningRef = useRef(false);
    const stateRef = useRef(state);
    stateRef.current = state;
    
    const [nextAutoPrompt, setNextAutoPrompt] = useState<string | null>(null);

    // Load initial state from localStorage
    useEffect(() => {
        try {
            const storedProvider = localStorage.getItem('llmProvider') as LLMProvider;
            if (storedProvider) {
                dispatch({ type: 'SET_LLM_PROVIDER', payload: storedProvider });
            }
            const storedKeys = localStorage.getItem('apiKeys');
            if (storedKeys) {
                const parsedKeys = JSON.parse(storedKeys);
                if (parsedKeys.openrouter) {
                     dispatch({ type: 'SET_API_KEY', payload: { provider: 'openrouter', key: parsedKeys.openrouter }});
                }
                if (parsedKeys.google) {
                     dispatch({ type: 'SET_API_KEY', payload: { provider: 'google', key: parsedKeys.google }});
                }
            }
        } catch (e) { console.error("Failed to load settings from localStorage", e); }

        const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        const initialTheme = storedTheme || 'light';
        setTheme(initialTheme);
        document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    }, []);

     // Save state to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('llmProvider', state.llmProvider);
            localStorage.setItem('apiKeys', JSON.stringify(state.apiKeys));
        } catch (e) { console.error("Failed to save settings to localStorage", e); }
    }, [state.llmProvider, state.apiKeys]);
    
    // Effect to handle autonomous continuation
    useEffect(() => {
        if (nextAutoPrompt) {
            const prompt = nextAutoPrompt;
            const executeNextStep = async () => {
                if (isRunningRef.current) return;
                const currentState = stateRef.current;
                setNextAutoPrompt(null);
                await handleSendMessage(prompt, currentState);
            };
            const timer = setTimeout(executeNextStep, 2500);
            return () => clearTimeout(timer);
        }
    }, [nextAutoPrompt]);

    const handleToggleTheme = useCallback(() => {
        setTheme(prevTheme => {
            const newTheme = prevTheme === 'light' ? 'dark' : 'light';
            document.documentElement.classList.toggle('dark', newTheme === 'dark');
            localStorage.setItem('theme', newTheme);
            return newTheme;
        });
    }, []);

    const handleSendMessage = useCallback(async (message: string, currentState?: AppState) => {
        const a_state = currentState || stateRef.current;
        if (message.trim() === '' || isRunningRef.current) return;
        
        const currentProviderKey = a_state.apiKeys[a_state.llmProvider];
        if (!currentProviderKey) {
            alert(`Please set your ${a_state.llmProvider === 'google' ? 'Google Gemini' : 'OpenRouter'} API key in the Settings tab.`);
            setActiveTab('settings');
            return;
        }

        isRunningRef.current = true;
        dispatch({ type: 'ADD_MESSAGE', payload: { author: 'user', content: message } });
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'ADD_MESSAGE', payload: { author: 'assistant', content: '' } });

        let fullStreamedContent = '';
        try {
            const stream = streamAgentCycle(
                message,
                a_state.conversation_history,
                a_state.docStructure,
                a_state.agent_schema,
                selectedNodePath,
                a_state.llmProvider,
                currentProviderKey
            );
            
            for await (const event of stream) {
                if (event.type === 'chunk') {
                    fullStreamedContent += event.payload; // Append chunks
                    dispatch({ type: 'UPDATE_LAST_MESSAGE', payload: fullStreamedContent });
                } else if (event.type === 'update') {
                    dispatch({ type: 'APPLY_AGENT_UPDATE', payload: event.payload });
                    if (event.payload.fileUpdate?.fileName) {
                        setLastUpdatedFile(event.payload.fileUpdate.fileName);
                        setSelectedNodePath(event.payload.fileUpdate.fileName);
                    }
                    if (event.payload.autoContinue) {
                        setNextAutoPrompt("Continue with the plan.");
                    } else {
                        isRunningRef.current = false;
                        dispatch({ type: 'SET_LOADING', payload: false });
                    }
                } else if (event.type === 'error') {
                     const errorMsg = `\n\n**Error:** ${event.payload}`;
                     dispatch({ type: 'UPDATE_LAST_MESSAGE', payload: fullStreamedContent + errorMsg });
                     isRunningRef.current = false;
                     dispatch({ type: 'SET_LOADING', payload: false });
                }
            }
        } catch (error) {
            console.error("Error processing agent stream:", error);
            const errorMessage = `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`;
            dispatch({ type: 'UPDATE_LAST_MESSAGE', payload: fullStreamedContent + errorMessage });
            isRunningRef.current = false;
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [selectedNodePath]);
    
    const handleStop = useCallback(() => {
        console.log("Stop button clicked. Halting autonomous process.");
        setNextAutoPrompt(null);
        isRunningRef.current = false;
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'ADD_MESSAGE', payload: { author: 'assistant', content: '⏹️ Autonomous process stopped by user.' } });
    }, []);

    const handleDownloadScaffold = useCallback(() => {
        const zip = new JSZip();
        addNodeToZip(state.docStructure, zip);
        zip.generateAsync({ type: "blob" }).then(content => saveAs(content, "mon_super_projet_docs.zip"));
    }, [state.docStructure]);

    const handleSaveFile = useCallback((path: string, content: string) => {
        dispatch({ type: 'SAVE_FILE_CONTENT', payload: { path, content } });
    }, []);

    const TABS = [
        { id: 'chat', label: 'Chat', icon: '💬' },
        { id: 'mission', label: 'Mission', icon: '⚙️' },
        { id: 'reasoning', label: 'Raisonnement', icon: '🔬' },
        { id: 'settings', label: 'Paramètres', icon: '🔧'},
    ];

    const selectedNode = findNodeByPath(state.docStructure, selectedNodePath || '');

    return (
        <div className="main-container max-w-[95rem] mx-auto p-4 sm:p-6 rounded-3xl flex flex-col">
            <Header onDownloadScaffold={handleDownloadScaffold} onToggleTheme={handleToggleTheme} />
            <div className="mt-4 grid grid-cols-12 gap-4 flex-grow min-h-0">
                <aside className="col-span-12 md:col-span-3 lg:col-span-3 bg-gray-50 dark:bg-gray-800/20 p-3 rounded-2xl overflow-auto min-w-0">
                    <h2 className="text-lg font-bold mb-3 px-2 text-[color:var(--text-color)]">Documentation Structure</h2>
                    <FileTree
                        node={state.docStructure}
                        selectedNodePath={selectedNodePath}
                        onNodeSelect={setSelectedNodePath}
                        lastUpdatedFile={lastUpdatedFile}
                    />
                </aside>
                <main className="col-span-12 md:col-span-5 lg:col-span-5 bg-gray-50 dark:bg-gray-800/20 p-1 rounded-2xl overflow-auto min-w-0">
                    <FileViewer 
                        node={selectedNode} 
                        path={selectedNodePath}
                        onSave={handleSaveFile}
                    />
                </main>
                <aside className="col-span-12 md:col-span-4 lg:col-span-4 flex flex-col bg-gray-50 dark:bg-gray-800/20 rounded-2xl p-3 min-w-0">
                    <Tabs tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <div className="flex-grow overflow-auto">
                        {activeTab === 'chat' && (
                             <ChatPanel
                                history={state.conversation_history}
                                onSendMessage={(msg) => handleSendMessage(msg)}
                                isLoading={state.isLoading || false}
                                panelId="agent-chat"
                                inputPlaceholder="Describe your project..."
                                submitButtonText="Send"
                                onStop={handleStop}
                            />
                        )}
                        {activeTab === 'mission' && <AgentConfigPanel schema={state.agent_schema} />}
                        {activeTab === 'reasoning' && <ReasoningPanel reasoning={state.agent_schema} />}
                        {activeTab === 'settings' && (
                            <SettingsPanel 
                                provider={state.llmProvider}
                                setProvider={(p) => dispatch({type: 'SET_LLM_PROVIDER', payload: p})}
                                apiKeys={state.apiKeys}
                                setApiKey={(provider, key) => dispatch({type: 'SET_API_KEY', payload: {provider, key}})}
                            />
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default App;