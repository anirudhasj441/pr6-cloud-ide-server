import * as fs from 'fs';
import { ROOT_PATH } from "..";
const createRootDir = () => {
    !fs.existsSync(ROOT_PATH) && fs.mkdirSync(ROOT_PATH);
}

export default createRootDir