
import { 
    existsSync,
    mkdirSync,
    writeFileSync,
    appendFileSync
} from "fs";

import { join } from "path";

const checkFolder = (dir: string) => {
    try {
        if (!existsSync(dir)) mkdirSync(dir);
    } catch (error) { }
}

const writeToFile = (name, data) => {

    const logPath = join(__dirname, "/../../logs/");
    checkFolder(logPath);

    const logFullPath = join(logPath, `${name}.log`);

    if (!existsSync(logFullPath)) writeFileSync(logFullPath, `> Logs mit dem Namen ${name}\n`);

    const time = new Date().toString().split(" ").slice(4, 5)[0];

    appendFileSync(logFullPath, `[${time}] ${data}\n`);
    console.log(`[${time}] ${data}`)

}

const debug = (name, data) => {
    if (globalThis.isDev) {
        writeToFile(name, data + "\n" );
    }
}

const error = (name, data) => {
    writeToFile(`error-${name}`, data);
}

const stream = {
    write: (message: string, encoding) => {
        writeToFile(`stream`, message);
    }
}

export default {
    info: writeToFile,
    debug,
    error,
    stream,
    time: () => + new Date()
}