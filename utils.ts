import { DocNode, DocFile, DocFolder } from './types';
import JSZip from 'jszip';

// Saves a blob to a file
export const saveAs = (blob: Blob, filename: string) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};

// Recursively finds a node in the doc structure by its path
export const findNodeByPath = (root: DocFolder, path: string): DocNode | null => {
    if (!path) return null;
    const pathSegments = path.split('/');
    
    let currentNode: DocNode = root;
    // The root itself is the first segment
    if (root.name !== pathSegments[0]) return null;

    for (let i = 1; i < pathSegments.length; i++) {
        const segment = pathSegments[i];
        if (currentNode.type !== 'folder') return null;
        const nextNode = currentNode.children.find(child => child.name === segment);
        if (!nextNode) return null;
        currentNode = nextNode;
    }
    return currentNode;
};

// Recursively finds and updates a file's content in an immutable way
export const findAndUpdateFile = (node: DocNode, targetPath: string, content: string): DocNode => {
    const recurse = (current: DocNode, currentPath: string): DocNode => {
        if (currentPath === targetPath) {
            if (current.type === 'file') {
                return { ...current, exampleContent: content };
            }
            return current; // Path matches but it's a folder, do nothing
        }
        
        if (current.type === 'folder' && targetPath.startsWith(currentPath + '/')) {
            const newChildren = current.children.map(child => recurse(child, `${currentPath}/${child.name}`));
            return { ...current, children: newChildren };
        }
        
        return current;
    };
    
    // The initial path starts with the root node's name
    return recurse(node, node.name);
};


// Recursively adds a node to a zip file
export const addNodeToZip = (node: DocNode, currentFolder: JSZip) => {
    if (node.type === 'folder') {
        const newFolder = currentFolder.folder(node.name);
        if(newFolder) {
            node.children.forEach(child => addNodeToZip(child, newFolder));
        }
    } else if (node.type === 'file') {
        currentFolder.file(node.name, (node as DocFile).exampleContent);
    }
};
