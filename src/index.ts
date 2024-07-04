import http from 'http'
import express from "express";
import { Server } from 'socket.io';
import * as pty from 'node-pty'

const PORT = process.env.PORT ?? 8000;

const ptyProcess = pty.spawn('bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.INIT_CWD + '/root',
    env: process.env
})

const app = express()
const server = http.createServer(app)

const io = new Server({
    cors: {
        origin: '*'
    }
})

app.get('/', (req, res) => {
    res.send({msg: "Hello, Devil!"}).status(200)
})

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
