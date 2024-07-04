import { Request, Response } from "express"
import generateFileTree from "../utils/FileTree"

export const index =  (req: Request, res: Response) => {
    res.send({msg: "Hello, World!"}).status(200)
}

export const listDir = async (req: Request, res: Response) => {
    const rootDir = process.env.INIT_CWD + '/root';

    const fileTree = await generateFileTree(rootDir);

    res.send({tree: fileTree}).status(200)

}
