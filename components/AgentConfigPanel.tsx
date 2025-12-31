import React from 'react';
import { AgentSchema } from '../types';

interface ConfigItemProps {
    label: string;
    children: React.ReactNode;
}

const ConfigItem: React.FC<ConfigItemProps> = ({ label, children }) => (
    <div className="py-4 border-b border-dashed border-[color:var(--border-color)] last:border-b-0">
        <div className="font-semibold text-[color:var(--text-color)] mb-1 text-md">
            {label}
        </div>
        <div className="text-[color:var(--text-muted-color)] bg-gray-100 dark:bg-gray-800/50 p-3 rounded-lg text-sm whitespace-pre-wrap break-words">
            {children || 'N/A'}
        </div>
    </div>
);

const AgentConfigPanel: React.FC<{ schema: AgentSchema }> = ({ schema }) => {
    return (
        <div className="card rounded-3xl p-4">
            <h2 className="section-title pb-2 mb-4 text-2xl font-extrabold">⚙️ Configuration de l'Agent</h2>
            <div className="space-y-2">
                <ConfigItem label="Mode Actuel">
                    <span className="font-mono bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                        {schema.mode}
                    </span>
                </ConfigItem>
                <ConfigItem label="Modes Disponibles">
                    {(schema.available_modes || []).join(', ')}
                </ConfigItem>
                 <ConfigItem label="Objectif Global (WM.g)">
                    {schema.wm.g}
                </ConfigItem>
                <ConfigItem label="Sous-Objectif Actuel (WM.sg)">
                    {schema.wm.sg}
                </ConfigItem>
                <ConfigItem label="Contexte (WM.ctx)">
                    {schema.wm.ctx}
                </ConfigItem>
                 <ConfigItem label="Transitions de Mode">
                    {(schema.mode_transitions || []).map((t, i) => `[${t.from} → ${t.to}] if (${t.trigger})`).join('\n')}
                </ConfigItem>
            </div>
        </div>
    );
};

export default AgentConfigPanel;