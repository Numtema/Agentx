export type DocNode = DocFolder | DocFile;

export interface DocBase {
    name: string;
    description: string;
}

export interface DocFolder extends DocBase {
    type: 'folder';
    children: DocNode[];
}

export interface DocFile extends DocBase {
    type: 'file';
    exampleContent: string;
}

export interface Message {
    author: 'user' | 'assistant' | string;
    content: string;
}

export interface LogicItem {
    symb: string;
    nl: string;
}

export interface ReasoningChainStep {
    step: string;
    status: 'pending' | 'completed' | 'failed';
}

/**
 * The new, unified schema inspired by the user's "MorphiusAgent" concept.
 * It represents the agent's entire cognitive state.
 */
export interface AgentSchema {
    mode: string;
    available_modes: string[];
    mode_transitions: { from: string; to: string; trigger: string; }[];
    wm: {
        g: string; // Global objective
        sg: string; // Immediate sub-goal
        ctx: string; // User context
        pr: {
            completed: string[]; // Completed steps
            current: string[]; // Current steps
        };
    };
    chain: {
        steps: ReasoningChainStep[];
        reflect: string;
        note: string[];
        warn: string[];
        err: string[];
    };
    kg: {
        tri: { sub: string; pred: string; obj: string }[];
    };
    logic: {
        propos: LogicItem[];
        proofs: LogicItem[];
        crits: LogicItem[];
        doubts: LogicItem[];
    };
    exp: string[]; // Expertise domains
    se: string[]; // Sub-domains
}

export type LLMProvider = 'google' | 'openrouter';

export interface AppState {
    conversation_history: Message[];
    agent_schema: AgentSchema;
    docStructure: DocFolder;
    isLoading?: boolean;
    llmProvider: LLMProvider;
    apiKeys: { [key in LLMProvider]?: string };
}

// Types for the new streaming and automation architecture

export interface FileUpdate {
    fileName: string;
    content: string;
}

export interface AgentUpdatePayload {
    updatedSchema: AgentSchema;
    fileUpdate: FileUpdate | null;
    autoContinue: boolean;
}

export type AgentStreamEvent =
    | { type: 'chunk'; payload: string }
    | { type: 'update'; payload: AgentUpdatePayload }
    | { type: 'error'; payload: string };