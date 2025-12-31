import React from 'react';
import { LLMProvider } from '../types';

interface SettingsPanelProps {
    provider: LLMProvider;
    setProvider: (provider: LLMProvider) => void;
    apiKeys: { [key in LLMProvider]?: string };
    setApiKey: (provider: LLMProvider, key: string) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ provider, setProvider, apiKeys, setApiKey }) => {
    return (
        <div className="card rounded-3xl p-4 h-full">
            <h2 className="section-title pb-2 mb-4 text-2xl font-extrabold">🔧 Paramètres</h2>
            <div className="space-y-6">
                <div>
                    <label htmlFor="llm-provider" className="block text-md font-semibold text-[color:var(--text-color)] mb-2">
                        Fournisseur LLM
                    </label>
                    <select
                        id="llm-provider"
                        value={provider}
                        onChange={(e) => setProvider(e.target.value as LLMProvider)}
                        className="w-full p-3 rounded-lg bg-[color:var(--card-bg-color)] border border-[color:var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-color)] text-sm"
                    >
                        <option value="google">Google Gemini</option>
                        <option value="openrouter">OpenRouter</option>
                    </select>
                </div>
                
                <div>
                    <label htmlFor="api-key" className="block text-md font-semibold text-[color:var(--text-color)] mb-2">
                        Clé d'API {provider === 'google' ? 'Google Gemini' : 'OpenRouter'}
                    </label>
                    <input
                        type="password"
                        id="api-key"
                        value={apiKeys[provider] || ''}
                        onChange={(e) => setApiKey(provider, e.target.value)}
                        className="w-full p-3 rounded-lg bg-[color:var(--card-bg-color)] border border-[color:var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-color)] font-mono text-sm"
                        placeholder={`Entrez votre clé d'API ${provider === 'google' ? 'Google Gemini' : 'OpenRouter'}`}
                    />
                     <p className="text-xs text-[color:var(--text-muted-color)] mt-2">
                        Votre clé est sauvegardée localement dans votre navigateur.
                    </p>
                </div>

                 <div className="text-sm text-[color:var(--text-muted-color)] p-4 border border-dashed border-[color:var(--border-color)] rounded-lg">
                    <p>
                        <strong className="text-[color:var(--text-color)]">Note : </strong>
                        Le changement de fournisseur LLM affectera les futurs appels de l'agent.
                        {provider === 'openrouter' && " Assurez-vous que votre clé est valide et que votre compte OpenRouter a accès au modèle `google/gemini-flash-1.5`."}
                         {provider === 'google' && " Votre clé d'API Google Gemini est nécessaire pour utiliser ce fournisseur."}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;