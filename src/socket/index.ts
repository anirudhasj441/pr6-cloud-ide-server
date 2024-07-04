import {Server as SocketServer} from "socket.io";

const io = new SocketServer({
    cors: {
        origin: '*'
    }
})

export default io