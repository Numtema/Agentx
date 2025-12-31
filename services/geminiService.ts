import { GoogleGenAI } from "@google/genai";
import { Message, DocFolder, DocNode, AgentSchema, AgentStreamEvent, LLMProvider } from "../types";

const getFileTree = (node: DocNode, path: string = ''): string[] => {
    const currentPath = path ? `${path}/${node.name}` : node.name;
    if (node.type === 'folder') {
        return node.children.flatMap(child => getFileTree(child, currentPath));
    }
    return [currentPath];
};

const JSON_RESPONSE_SEPARATOR = "|||AGENT_RESPONSE_JSON|||";

const getSystemInstruction = (agentSchema: AgentSchema, fileList: string) => {
    return `You are 🌀 AGENTX, an autonomous AI software architect. Your mission is to help a user create a complete project documentation scaffold. You operate based on a REASONING_SCHEMA which represents your internal state.

**Autonomous Operation:**
- For high-level goals, you MUST first create a multi-step plan in 'chain.steps'.
- Then, execute the FIRST step of your plan.
- When you complete a step, you MUST update its status to 'completed'. For the next cycle, you will move this completed step from 'chain.steps' to 'wm.pr.completed'.
- In your response, if there are more steps pending in 'chain.steps', set 'autoContinue' to true. The system will automatically send you a "Continue" prompt.
- When all steps are completed and moved, set 'autoContinue' to false.

**Response Protocol (MANDATORY):**
1.  First, stream your friendly chat message to the user as plain text. This message MUST end with the three specific follow-up questions.
2.  After the chat message, output the exact separator token: ${JSON_RESPONSE_SEPARATOR}
3.  Finally, output a SINGLE, VALID JSON object containing your updates.

**Rules:**
-   **CRITICAL JSON RULE**: The final JSON object MUST NOT be wrapped in markdown fences (\`\`\`json) or any other text. It must be a raw JSON object.
-   **Schema Update**: Always update 'wm.sg' (sub-goal), 'wm.ctx' (context), and 'chain.reflect' (your reasoning).
-   **Planning**: 'chain.steps' MUST be an array of objects with this structure: { "step": "description", "status": "pending" }.
-   **Execution**: When continuing, identify the next "pending" step, execute it, and update its status to "completed".
-   **File Update**: If you update a file, provide its FULL path and FULL new content.
-   **Chat Response**: Your streamed chat response MUST end with these three questions on new lines:
🔍 [Investigation?]
🔭 [Exploration?]
🎯 [Exploitation?]
-   **JSON Integrity**: Your final JSON object must be perfect. Properly escape all special characters within the strings (e.g., use '\\"' for quotes, '\\n' for newlines).

Your current REASONING_SCHEMA is:
${JSON.stringify(agentSchema, null, 2)}

The documentation file structure is:
${fileList}`;
};


export async function* streamAgentCycle(
    prompt: string,
    history: Message[],
    docStructure: DocFolder,
    agentSchema: AgentSchema,
    selectedFilePath: string | null,
    provider: LLMProvider,
    apiKey: string
): AsyncGenerator<AgentStreamEvent> {

    const fileList = getFileTree(docStructure).join('\n');
    const systemInstruction = getSystemInstruction(agentSchema, fileList);
    const historyContext = history
        .slice(-6)
        .map(msg => `${msg.author}: ${msg.content}`)
        .join('\n');

    let buffer = "";

    try {
        if (provider === 'google') {
            if (!apiKey) throw new Error("Google Gemini API key is missing. Please set it in the settings.");
            const ai = new GoogleGenAI({ apiKey: apiKey });
            const stream = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash-preview-04-17',
                contents: `Conversation History:\n${historyContext}\n\nLatest User Prompt: "${prompt}"`,
                config: { systemInstruction },
            });
            for await (const chunk of stream) {
                // The Google SDK conveniently gives us the text directly.
                buffer += chunk.text;
            }

        } else if (provider === 'openrouter') {
            if (!apiKey) throw new Error("OpenRouter API key is missing. Please set it in the settings.");
            
            const openRouterHistory = history.slice(-6).map(msg => ({
                role: msg.author,
                content: msg.content
            }));
            const messages = [
                { role: 'system', content: systemInstruction },
                ...openRouterHistory,
                { role: 'user', content: prompt }
            ];

            try {
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': location.href,
                        'X-Title': document.title,
                    },
                    body: JSON.stringify({
                        model: "google/gemini-flash-1.5", // Upgraded model for better performance
                        messages,
                        stream: true,
                    }),
                });

                if (!response.ok || !response.body) {
                    const errorBody = await response.text();
                    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorBody}`);
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const decodedChunk = decoder.decode(value);
                    const lines = decodedChunk.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.substring(6);
                            if (data.trim() === '[DONE]') continue;
                            try {
                                const json = JSON.parse(data);
                                if (json.choices && json.choices[0].delta.content) {
                                    buffer += json.choices[0].delta.content;
                                }
                            } catch (e) {
                                // Ignore non-JSON data lines
                            }
                        }
                    }
                }
            } catch (e) {
                if (e instanceof TypeError && e.message.includes("Failed to construct 'Request'")) {
                     throw new Error("Invalid character found in request headers. Please check that your API key contains only standard ASCII characters.");
                }
                throw e; // Re-throw other errors
            }
        }
        
        const separatorIndex = buffer.indexOf(JSON_RESPONSE_SEPARATOR);

        if (separatorIndex !== -1) {
            const chatPart = buffer.substring(0, separatorIndex);
            let jsonPart = buffer.substring(separatorIndex + JSON_RESPONSE_SEPARATOR.length).trim();
            
            yield { type: 'chunk', payload: chatPart };

            // Sanitize the JSON part to remove markdown fences
            const fenceRegex = /^\s*```(?:json)?\n?(.*?)\n?```\s*$/s;
            const match = jsonPart.match(fenceRegex);
            if (match && match[1]) {
                jsonPart = match[1].trim();
            }
            
            try {
                const parsedData = JSON.parse(jsonPart);
                 if (!parsedData.updatedSchema || typeof parsedData.autoContinue !== 'boolean') {
                     throw new Error("AI response is missing required fields: updatedSchema and autoContinue are mandatory.");
                }
                yield { type: 'update', payload: parsedData };

            } catch (e) {
                 const parseError = `Failed to parse JSON payload. Raw: '${jsonPart}'. Error: ${e instanceof Error ? e.message : String(e)}`;
                 console.error(parseError);
                 yield { type: 'error', payload: parseError };
            }
        } else {
            const errorMsg = "Agent did not return the required separator token and JSON object.";
            console.error(errorMsg, "Full response from LLM:", buffer);
            yield { type: 'error', payload: `${errorMsg}\nFull response from LLM:\n${buffer}` };
        }

    } catch (error) {
        const errorMessage = `Error calling API: ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMessage);
        yield { type: 'error', payload: errorMessage };
    }
};