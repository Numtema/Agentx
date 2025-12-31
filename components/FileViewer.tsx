import React, { useMemo, useState, useEffect } from 'react';
import showdown from 'showdown';
import { DocNode } from '../types';
import { FileIcon, FolderIcon, DocsIcon } from './icons';

interface FileViewerProps {
    node: DocNode | null;
    path: string | null;
    onSave: (path: string, content: string) => void;
}

const FileViewer: React.FC<FileViewerProps> = ({ node, path, onSave }) => {
    const [viewMode, setViewMode] = useState<'preview' | 'source'>('preview');
    const [editedContent, setEditedContent] = useState('');
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (node?.type === 'file') {
            setEditedContent(node.exampleContent);
            setViewMode('preview'); // Default to preview when node changes
            setIsDirty(false);
        }
    }, [node]);

    const converter = useMemo(() => new showdown.Converter({
        tables: true,
        simplifiedAutoLink: true,
        strikethrough: true,
        tasklists: true,
        ghCompatibleHeaderId: true,
        simpleLineBreaks: true,
    }), []);

    const contentHtml = useMemo(() => {
        if (node?.type === 'file') {
            return converter.makeHtml(viewMode === 'preview' ? node.exampleContent : editedContent);
        }
        return '';
    }, [node, converter, editedContent, viewMode]);
    
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditedContent(e.target.value);
        if (node?.type === 'file') {
            setIsDirty(e.target.value !== node.exampleContent);
        }
    };
    
    const handleSave = () => {
        if (path && isDirty) {
            onSave(path, editedContent);
            setIsDirty(false);
        }
    };

    if (!node) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-[color:var(--text-muted-color)] p-4">
                <DocsIcon className="w-24 h-24 mb-4 text-gray-300 dark:text-gray-600" />
                <h2 className="text-2xl font-bold text-[color:var(--text-color)]">File Viewer</h2>
                <p className="max-w-md mt-2">Select a file from the tree on the left to see its content here.</p>
                <p className="max-w-md mt-4">Use the chat panel on the right to give instructions to AGENTX and watch the documentation come to life.</p>
            </div>
        );
    }

    return (
        <div className="file-viewer p-4 md:p-6 h-full flex flex-col">
            <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                    {node.type === 'folder' 
                        ? <FolderIcon className="w-8 h-8 text-[color:var(--primary-color)] flex-shrink-0" /> 
                        : <FileIcon className="w-8 h-8 text-[color:var(--primary-color)] flex-shrink-0" />
                    }
                     <h3 className="!border-b-0 !pb-0 !mb-0 truncate">{node.name}</h3>
                </div>
                {node.type === 'file' && (
                    <div className="view-toggle flex-shrink-0">
                        <button onClick={() => setViewMode('preview')} className={viewMode === 'preview' ? 'active' : ''}>Preview</button>
                        <button onClick={() => setViewMode('source')} className={viewMode === 'source' ? 'active' : ''}>Source</button>
                    </div>
                )}
            </div>
           
            <h4 className="!mt-2">Purpose</h4>
            <p>{node.description}</p>
            
            {node.type === 'file' && (
                <>
                    <div className="flex justify-between items-center">
                        <h4 className="flex-grow">Content</h4>
                        {isDirty && viewMode === 'source' && (
                             <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-4 rounded-full text-sm">
                                Save
                            </button>
                        )}
                    </div>
                    {viewMode === 'preview' ? (
                         <div 
                            className="prose dark:prose-invert max-w-none space-y-4 overflow-y-auto flex-grow"
                            dangerouslySetInnerHTML={{ __html: contentHtml }} 
                        />
                    ) : (
                        <textarea
                            value={editedContent}
                            onChange={handleContentChange}
                            className="w-full h-full flex-grow bg-[color:var(--code-bg-color)] text-[color:var(--text-color)] p-4 rounded-lg font-mono text-sm border border-[color:var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-color)]"
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default FileViewer;
