import * as fs from 'fs/promises'
import * as path from  'path';
import { ROOT_PATH } from '..';

interface ITreeNode {
    id: string
    label: string
    path:string
    relativePath: string
    type: "file" | "folder"
    children?: ITreeNode[]
}

const createNode = async (parent: string, dir: string): Promise<ITreeNode> => {
    const dirPath = path.join(parent, dir);
    const isDir = (await fs.lstat(dirPath)).isDirectory();
    const node:ITreeNode = {
        id: dirPath,
        label: dir,
        path: dirPath,
        relativePath: dirPath.replace(ROOT_PATH + "/", '') ,
        type: isDir ? "folder" : "file"
    }

    if(!isDir) return node;
    node.children = [];
    const children = await fs.readdir(dirPath)
    for(const child of children) {
        const childNode = await createNode(dirPath, child)
        node.children?.push(childNode)
    }
    return node;
}

const generateFileTree = async (rootDir: string): Promise<ITreeNode[]> => {
    const tree:ITreeNode[] = []
    const dirs = await fs.readdir(rootDir)
    for(const dir of dirs) {
        tree.push(await createNode(rootDir, dir))
    }
    return tree;
}

export default generateFileTree;