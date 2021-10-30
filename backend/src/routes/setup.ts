import { createConnection, getDatabaseModels } from "../database/initdb";
import config from "../utils/config";
import { SocketWithData } from "../utils/socket";
import * as crypto from 'crypto';


export default (socket: SocketWithData, slog) => {

    

    socket
    
    .on("/setup/save", async (setupData, call: {(error: boolean, tab?: number, problemWithInput?: { inputid: string, msg: string, inputValue: string }): void}) => {

        if (config.get("mysql:database") !== "") {
            return;
        }

        for (const dataset of setupData) {

            if (!dataset.name.startsWith("admin-"))
                config.set(dataset.name.replace("-", ":"), dataset.value);

        }

        const sequelize = createConnection();
        const models: any = getDatabaseModels(sequelize);

        sequelize.sync()
        .then(async () => {

            const username = setupData.find(e => e.name === "admin-username").value;
            const password = setupData.find(e => e.name === "admin-password").value;

            const salt = await crypto.randomBytes(64).toString("hex");

            const passwordHash = crypto.createHash('sha512').update(
                salt.split("").sort().join("") + password + salt
            ).digest('hex');

            await models.User.create({
                name: username,
                password: passwordHash,
                role: "admin",
                salt
            });

            call(false);

        })
        .catch(() => {
            console.log("ERROR");
            call(true, 0, {
                inputid: "mysql-host",
                msg: "Host could not be reached",
                inputValue: ""
            });
        });

    })


    
}