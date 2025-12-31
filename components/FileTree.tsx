import React, { useState } from 'react';
import { DocNode, DocFolder } from '../types';
import { FileIcon, FolderIcon, ChevronRightIcon } from './icons';

interface FileTreeProps {
    node: DocFolder;
    selectedNodePath: string | null;
    onNodeSelect: (path: string) => void;
    lastUpdatedFile: string | null;
}

const TreeNode: React.FC<{
    node: DocNode;
    level: number;
    path: string;
    selectedNodePath: string | null;
    onNodeSelect: (path: string) => void;
    lastUpdatedFile: string | null;
}> = ({ node, level, path, selectedNodePath, onNodeSelect, lastUpdatedFile }) => {
    const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first two levels

    const isFolder = node.type === 'folder';
    const isActive = path === selectedNodePath;
    const isModified = path === lastUpdatedFile;

    const handleToggle = () => {
        if (isFolder) {
            setIsExpanded(!isExpanded);
        }
        onNodeSelect(path);
    };

    return (
        <div>
            <div
                className={`file-tree-node ${isActive ? 'active' : ''} ${isModified ? 'modified' : ''}`}
                onClick={handleToggle}
                style={{ paddingLeft: `${level * 1.25 + 0.5}rem` }}
            >
                {isFolder ? (
                    <>
                        <ChevronRightIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        <FolderIcon className="w-5 h-5" />
                    </>
                ) : (
                    <FileIcon className="w-5 h-5 ml-4" /> // ml-4 to align with folder content
                )}
                <span className="flex-grow truncate">{node.name}</span>
            </div>
            {isFolder && isExpanded && (
                <div>
                    {(node as DocFolder).children.map((child) => (
                        <TreeNode
                            key={`${path}/${child.name}`}
                            node={child}
                            level={level + 1}
                            path={`${path}/${child.name}`}
                            selectedNodePath={selectedNodePath}
                            onNodeSelect={onNodeSelect}
                            lastUpdatedFile={lastUpdatedFile}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const FileTree: React.FC<FileTreeProps> = ({ node, selectedNodePath, onNodeSelect, lastUpdatedFile }) => {
    return (
        <div className="space-y-1">
             <TreeNode
                node={node}
                level={0}
                path={node.name}
                selectedNodePath={selectedNodePath}
                onNodeSelect={onNodeSelect}
                lastUpdatedFile={lastUpdatedFile}
            />
        </div>
    );
};

export default FileTree;