import http from 'http'
import express from "express";
import * as pty from 'node-pty'
import router from './router';
import io from './socket';
import * as fs from 'fs';
import { createRootDir } from './middleware';
import cors from 'cors';

const PORT = process.env.PORT ?? 8000;

export const ROOT_PATH = process.env.INIT_CWD + '/root'

const ptyProcess = pty.spawn('bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: ROOT_PATH,
    env: process.env
})

const app = express()
const server = http.createServer(app)

app.use(cors())

app.use(createRootDir)

app.use('/', router)

io.attach(server);

ptyProcess.onData((data: string) => {
    io.emit('terminal:data', data)
})

io.on('connection', (socket) => {
    console.log("socket connected!!");
    socket.on('terminal:write', (data) => {
        ptyProcess.write(data);
    })
})

server.listen(PORT, () => console.log("Server listen on", PORT))
