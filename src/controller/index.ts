import { Request, Response } from "express"
import generateFileTree from "../utils/FileTree"
import * as fs from 'fs/promises'

export const index =  (req: Request, res: Response) => {
    res.send({msg: "Hello, World!"}).status(200)
}

export const listDir = async (req: Request, res: Response) => {
    const rootDir = process.env.INIT_CWD + '/root';

    const fileTree = await generateFileTree(rootDir);

    res.send({tree: fileTree}).status(200)

}

export const openFile = async(req: Request, res: Response) => {
    const data = req.body;
    const filePath = data.filePath;

    const content = await fs.readFile(filePath, 'utf-8');

    res.send({content: content}).status(200)
}
