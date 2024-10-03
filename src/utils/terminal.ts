import * as pty from 'node-pty';
import { ROOT_PATH } from '..';

let terminal: pty.IPty | null = null

export const createTerminal = (): pty.IPty => {

    if(terminal) return terminal;

    terminal = pty.spawn('bash', [], {
        name: 'xterm-color', 
        cols: 80,
        rows: 30,
        cwd: ROOT_PATH,
        env: process.env
    })

    return terminal;
}

