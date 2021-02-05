import { readdirSync } from "fs";
import { join, basename } from "path";

import config from "../utils/config"

import { Sequelize } from "sequelize";

const c = {
    database: config.get("mysql:database"),
    user: config.get("mysql:user"),
    pass: config.get("mysql:pass"),
    host: config.get("mysql:host"),
    port: config.get("mysql:port")
}

let sequelize = new Sequelize(`mysql://${c.user}:${c.pass}@${c.host}:/${c.database}`, {
    logging: false
});

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

export const Token = models.Token;
export const User = models.User;
export const Webauthn = models.Webauthn;
export const Session = models.Session;
export const Service = models.Service;
export const Notifications = models.Notifications;

export default {
    ...models,
    Sequelize,
    sequelize
}