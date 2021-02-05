
import {
    existsSync,
    writeFileSync,
    readFileSync
} from "fs";
import { join } from "path";

import * as nconf from "nconf";

export default new class {

    defaultConfigPath: string = join(__dirname, "/../../config.json")

    constructor () {

        if (!existsSync(this.defaultConfigPath)) {
            writeFileSync(this.defaultConfigPath, JSON.stringify({}));
        }

        nconf.defaults(
            JSON.parse(
                readFileSync(this.defaultConfigPath).toString()
            )
        )
        
    }

    get (param: string) {
        return  nconf.get(param);
    }

}