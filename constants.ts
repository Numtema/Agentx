import { AppState, AgentSchema } from './types';

const INITIAL_AGENT_SCHEMA: AgentSchema = {
    mode: 'ANALYSIS',
    available_modes: ['ANALYSIS', 'CONTENT_GENERATION', 'REFINEMENT'],
    mode_transitions: [
        { from: 'ANALYSIS', to: 'CONTENT_GENERATION', trigger: 'User provides initial project scope.' },
        { from: 'CONTENT_GENERATION', to: 'REFINEMENT', trigger: 'Initial documents are generated.' },
        { from: 'REFINEMENT', to: 'REFINEMENT', trigger: 'User provides feedback.' },
    ],
    wm: {
        g: "Generate a complete and coherent project documentation from user descriptions.",
        sg: "Clarify the project scope with the user.",
        ctx: "Awaiting user's initial project description.",
        pr: {
            completed: [],
            current: ["Understand project scope"],
        },
    },
    chain: {
        steps: [],
        reflect: "Ready to receive project details from the user. The first step is to understand what we are building.",
        note: [],
        warn: [],
        err: [],
    },
    kg: { tri: [] },
    logic: {
        propos: [],
        proofs: [],
        crits: [],
        doubts: [],
    },
    exp: ["Software Architecture", "Technical Writing", "Requirement Analysis", "UML & Mermaid.js"],
    se: ["Documentation Structure", "Markdown Formatting", "API Design", "Database Schema"],
};


export const INITIAL_STATE: Omit<AppState, 'docStructure'> = {
    conversation_history: [{ author: "assistant", content: "Bonjour! I am AGENTX. I now operate with a more advanced reasoning model. Describe your project, and I'll generate the documentation while showing you my thought process. What we are building today?" }],
    agent_schema: INITIAL_AGENT_SCHEMA,
    llmProvider: 'google',
    apiKeys: {
        google: '',
        openrouter: '',
    },
};