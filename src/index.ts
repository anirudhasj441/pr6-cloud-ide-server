import http from "http";
import express from "express";
import * as pty from "node-pty";
import router from "./router";
import io from "./socket";
import * as fs from "fs/promises";
import cors from "cors";
import * as chokidar from "chokidar";
import createRootDir from "./utils/createRootDir";
import os from "os";
import { createTerminal } from "./utils/terminal";

//CONSTANTS
const PORT = process.env.PORT ?? 8000;
console.log("IN CONTAINER: ", process.env.RUN_IN_CONTAINER);
export const ROOT_PATH = process.env.RUN_IN_CONTAINER
    ? os.homedir() + "/workspace"
    : process.env.INIT_CWD + "/workspace";
// export const ROOT_PATH = os.homedir() + '/workspace'

createRootDir();

const app = express();
const server = http.createServer(app);

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", router);

io.attach(server);

try {
    if (!process.stdout.isTTY) throw "TTY is required!";
    const terminal = createTerminal();

    process.stdout.on("resize", () => {
        try {
            terminal.resize(process.stdout.columns, process.stdout.rows);
        } catch (error) {
            console.log("RESIZE ERROR: ", error);
        }
    });

    terminal.onData((data: string) => {
        io.emit("terminal:data", data);
    });

    terminal.onExit(() => {
        console.log("Terminal killed!!");
    });

    chokidar.watch(ROOT_PATH).on("all", (event, path) => {
        io.emit("files:refresh");
    });

    io.on("connection", (socket) => {
        console.log("socket connected!!");
        socket.on("terminal:write", (data) => {
            terminal.write(data);
        });

        socket.on("file:save", async (filePath: string, content: string) => {
            await fs.writeFile(filePath, content);
        });

        socket.on("terminal:resize", (cols: number, rows: number) => {
            try {
                // terminal.resize(cols, rows)
            } catch (error) {
                console.log("RESIZE ERROR: ", error);
            }
        });
    });
} catch (error) {
    console.log("ERROR: ", error);
}

server.listen(PORT, () => console.log("Server listen on", PORT));
