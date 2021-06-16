import { readdirSync } from "fs";
import { join, basename } from "path";

import config from "../utils/config"

import { Sequelize } from "sequelize";


export function createConnection () {

    const c = {
        database: config.get("mysql:database"),
        user: config.get("mysql:user"),
        pass: config.get("mysql:pass"),
        host: config.get("mysql:host"),
        port: config.get("mysql:port")
    }
    
    return new Sequelize(`mysql://${c.user}:${c.pass}@${c.host}:/${c.database}`, {
        logging: false
    });

}

export function getDatabaseModels (sequelize) {
    const models: any = {}

    readdirSync(join(__dirname, "models"))
    .filter(file => (
        file.indexOf('.') !== 0 &&
        file !== basename(__filename) &&
        file.slice(-3) === '.js'
    ))
    .forEach((file) => {
        const model = sequelize.import(join(__dirname, "models", file));
        models[model.name] = model;
    });

    Object.keys(models).forEach((modelName) => {
        if (models[modelName].associate)
            models[modelName].associate(models);
    })
    return models;

}

let sequelize = createConnection(); 
const models: any = getDatabaseModels(sequelize);

export let Token = models.Token;
export let User = models.User;
export let Session = models.Session;
export let Service = models.Service;
export let Notifications = models.Notifications;

export default {
    ...models,
    Sequelize,
    sequelize
}