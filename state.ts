import { AppState, AgentUpdatePayload, DocFolder } from './types';
import { findAndUpdateFile } from './utils';

// Reducer for complex state management
export const appReducer = (state: AppState, action: any): AppState => {
    switch (action.type) {
        case 'ADD_MESSAGE': {
            const history = [...state.conversation_history];
            // If the last message was an empty assistant message, replace it. Otherwise, add a new one.
            if (history.length > 0 && history[history.length - 1].author === 'assistant' && history[history.length - 1].content === '') {
                 history[history.length - 1] = action.payload;
            } else {
                 history.push(action.payload);
            }
            return { ...state, conversation_history: history };
        }
        case 'UPDATE_LAST_MESSAGE': {
             const newHistory = [...state.conversation_history];
             const lastMessage = newHistory[newHistory.length-1];
             if (lastMessage && lastMessage.author === 'assistant') {
                 lastMessage.content = action.payload;
             }
             return { ...state, conversation_history: newHistory };
        }
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'APPLY_AGENT_UPDATE': {
            const { updatedSchema, fileUpdate } = action.payload as AgentUpdatePayload;
            let newDocStructure = state.docStructure;

            if (fileUpdate?.fileName && fileUpdate.content) {
                newDocStructure = findAndUpdateFile(state.docStructure, fileUpdate.fileName, fileUpdate.content) as DocFolder;
            }
            return { ...state, agent_schema: updatedSchema, docStructure: newDocStructure };
        }
        case 'SAVE_FILE_CONTENT': {
            const { path, content } = action.payload;
            const newDocStructure = findAndUpdateFile(state.docStructure, path, content) as DocFolder;
            return { ...state, docStructure: newDocStructure };
        }
        case 'SET_LLM_PROVIDER':
            return { ...state, llmProvider: action.payload };
        case 'SET_API_KEY':
            return {
                ...state,
                apiKeys: {
                    ...state.apiKeys,
                    [action.payload.provider]: action.payload.key,
                },
            };
        default:
            return state;
    }
};
