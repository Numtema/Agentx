import React from 'react';
import { AgentSchema, LogicItem } from '../types';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-xl font-bold text-[color:var(--text-color)] border-b-2 border-[color:var(--border-color)] pb-2 mb-3">
            {title}
        </h3>
        {children}
    </div>
);

const LogicList: React.FC<{ title: string; items: LogicItem[] }> = ({ title, items }) => {
    if (!items || items.length === 0) return null;
    return (
        <div className="mt-3">
            <h4 className="font-semibold text-md text-[color:var(--text-color)]">{title}</h4>
            <ul className="list-disc list-inside space-y-1 pl-2 text-sm text-[color:var(--text-muted-color)]">
                {items.map((item, index) => (
                    <li key={index}>
                        {typeof item === 'string' ? item : (
                            <>
                                <code className="bg-gray-200 dark:bg-gray-700 rounded px-1 py-0.5 text-xs">{item.symb}</code>: {item.nl}
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};


const ReasoningPanel: React.FC<{ reasoning: AgentSchema }> = ({ reasoning }) => {
    const { exp, se, wm, kg, logic, chain } = reasoning;

    return (
        <div className="card rounded-3xl p-4">
            <h2 className="section-title pb-2 mb-4 text-2xl font-extrabold">🔬 Raisonnement Détaillé</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Section title="🧠 Expertise">
                        <ul className="list-disc list-inside space-y-1 text-sm text-[color:var(--text-muted-color)]">
                            {exp.map(item => <li key={item}>{item}</li>)}
                        </ul>
                    </Section>

                    <Section title="📚 Sous-domaines">
                        <ul className="list-disc list-inside space-y-1 text-sm text-[color:var(--text-muted-color)]">
                            {se.map(item => <li key={item}>{item}</li>)}
                        </ul>
                    </Section>

                    <Section title="💡 Logique">
                        <LogicList title="Propositions" items={logic.propos} />
                        <LogicList title="Preuves" items={logic.proofs} />
                        <LogicList title="Critiques" items={logic.crits} />
                        <LogicList title="Doutes" items={logic.doubts} />
                    </Section>
                </div>

                <div>
                    <Section title="💾 Mémoire de Travail (WM)">
                        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl border border-[color:var(--border-color)] text-sm whitespace-pre-wrap font-mono">
                            {`Goal       : ${wm.g}\nSubgoal    : ${wm.sg}\nCompleted  : ${wm.pr.completed.join(', ') || 'None'}\nCurrent    : ${wm.pr.current.join(', ') || 'None'}\nContext    : ${wm.ctx}`}
                        </pre>
                    </Section>

                    <Section title="🕸️ Knowledge Graph">
                        {kg.tri && kg.tri.length > 0 ? (
                            <ul className="space-y-2 text-sm">
                                {kg.tri.map(({ sub, pred, obj }, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <span className="font-semibold text-blue-600 dark:text-blue-400">{sub}</span>
                                        <span className="text-xs bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-1">{pred}</span>
                                        <span className="font-semibold text-green-600 dark:text-green-400">{obj}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (<p className="text-sm text-[color:var(--text-muted-color)]">Vide.</p>)}
                    </Section>

                    <Section title="🔗 Chaîne de Raisonnement">
                         <div className="space-y-2 text-sm">
                            {chain.steps && chain.steps.length > 0 ? chain.steps.map((s, i) => (
                                <div key={i} className={`p-2 border-l-2 rounded-r-md ${s.status === 'completed' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'}`}>
                                    <strong>{s.status === 'completed' ? '✅' : '⏳'}</strong> {s.step}
                                </div>
                            )) : <p className="text-sm text-[color:var(--text-muted-color)]">Pas encore d'étapes.</p>}
                        </div>
                        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <strong className="block text-sm">Reflect:</strong>
                            <p className="text-sm italic text-[color:var(--text-muted-color)]">{chain.reflect}</p>
                        </div>
                    </Section>
                </div>
            </div>
        </div>
    );
};

export default ReasoningPanel;