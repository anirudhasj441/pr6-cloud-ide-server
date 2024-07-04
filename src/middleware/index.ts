import { Request, Response, NextFunction } from "express";
import * as fs from 'fs';
import { ROOT_PATH } from "..";
export const createRootDir = (req: Request, res: Response, next: NextFunction) => {
    !fs.existsSync(ROOT_PATH) && fs.mkdirSync(ROOT_PATH);
    next();
}