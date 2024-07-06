import http from 'http'
import express from "express";
import * as pty from 'node-pty'
import router from './router';
import io from './socket';
import * as fs from 'fs/promises';
import cors from 'cors';
import * as chokidar from 'chokidar';
import createRootDir from './utils/createRootDir';
import os from 'os'

//CONSTANTS
const PORT = process.env.PORT ?? 8000;
console.log("IN CONTAINER: ", process.env.RUN_IN_CONTAINER)
export const ROOT_PATH = process.env.RUN_IN_CONTAINER ? 
    os.homedir() + '/workspace' : process.env.INIT_CWD + '/workspace'
// export const ROOT_PATH = os.homedir() + '/workspace'

createRootDir();

const app = express()
const server = http.createServer(app)

app.use(cors())

app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use('/', router)

io.attach(server);

try {
    if(! process.stdout.isTTY) throw "TTY is required!"
    const ptyProcess = pty.spawn('bash', [], {
        name: 'xterm-color', 
        cols: 80,
        rows: 30,
        cwd: ROOT_PATH,
        env: process.env
    })

    process.stdout.on('resize', () => {
        try {
            ptyProcess.resize(process.stdout.columns, process.stdout.rows)
        } catch (error){
            console.log("RESIZE ERROR: ", error)
        }
    })
    
    ptyProcess.onData((data: string) => {
        io.emit('terminal:data', data)
    })
    
    chokidar.watch(ROOT_PATH).on('all', (event, path) => {
        io.emit('files:refresh');
    })
    
    io.on('connection', (socket) => {
        console.log("socket connected!!");
        socket.on('terminal:write', (data) => {
            ptyProcess.write(data);
        })
    
        socket.on("file:save", async(filePath: string, content: string) => {
            await fs.writeFile(filePath, content)
        })
    
        socket.on("terminal:resize", (cols: number, rows: number) => {
            try {
                // ptyProcess.resize(cols, rows)
            } catch(error) {
                console.log("RESIZE ERROR: ", error)
            }
    
        })
    })
} catch (error){
    console.log("ERROR: ", error)
}

server.listen(PORT, () => console.log("Server listen on", PORT))
