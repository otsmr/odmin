
import {
    existsSync,
    writeFileSync,
    readFileSync
} from "fs";
import { join } from "path";

import * as nconf from "nconf";

export default new class {

    defaultConfigPath: string = join(__dirname, "..", "data", "config.json")

    constructor () {

        if (!existsSync(this.defaultConfigPath)) {
            writeFileSync(this.defaultConfigPath, JSON.stringify({
                "server": {
                  "port": 3030
                },
                "runmode": "development", //  | production
                "frontend-base-url": "http://localhost:1004",
                "privacy": {
                  "ip-addresses-pseudonymize": true,
                  "ip-localization-service": "https://ipinfo.oproj.de/"
                },
                "dev": {
                  "invitetoken": "token"
                },
                "email": {
                  "account": "\"Name\" <info@email.de>"
                },
                "mysql": {
                  "database": "",
                  "user": "",
                  "pass": "",
                  "host": "",
                  "port": 3306
                },
                "smtp": {
                  "host": "",
                  "port": "",
                  "secure": "",
                  "user": "",
                  "pass": ""
                }
            }, null, 4));
        }

        nconf.defaults(this.getSavedConfigs())
        
    }

    getSavedConfigs () {
        return JSON.parse(
            readFileSync(this.defaultConfigPath).toString()
        )
    }


    get (param: string) {
        return  nconf.get(param);
    }

    set (param: string, value: any) {
        nconf.set(param, value)

        let params = param.split(":");

        const configs = this.getSavedConfigs();

        switch (params.length) {
            case 1: configs[params[0]] = value; break;
            case 2: configs[params[0]][params[1]] = value; break;
        
        }

        writeFileSync(this.defaultConfigPath, JSON.stringify(configs, null, 4));
        
        nconf.defaults(this.getSavedConfigs());

    }

}