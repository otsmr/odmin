
import * as fs from "fs"

import { join } from "path"

import * as nodeMailer from "nodemailer"

import config from "../utils/config"
import log from "../utils/logs"


export default (data: {
    type: string,
    from: string,
    to: string,
    subject: string,
    replace?: any,
    success?: {(error: any, info: any)}
}) => {

    const templateFilePath = join(__dirname, "templates", `${data.type}.html`);

    if (!fs.existsSync(templateFilePath)) {
        log.error("notifications", `sendMail: template "${data.type}" not found`);
        return;
    }

    let html = fs.readFileSync(templateFilePath, "utf-8").toString();

    for (const from in data.replace) {
        html = html.replace(`#${from}#`, data.replace[from]) //TODO: Reaplce width ejs
    }

    try {

        let transporter = nodeMailer.createTransport({
            host: config.get("smtp:host"),
            port: config.get("smtp:port"),
            secure: config.get("smtp:secure"),
            auth: {
                user: config.get("smtp:user"),
                pass: config.get("smtp:pass")
            }
        });
    
        transporter.sendMail({
            from: data.from,
            to: data.to,
            subject: data.subject,
            html
        }, (error, info) => {
    
            if (data.success) data.success(error, info);
            
            if (!error)
                if (config.get("runmode") === "development") {
                    log.info("notifications", `E-Mail versendet an ${data.to} [MessageID:${info.messageId}] [ServerResponse:${info.response}]`)
                }
            else {
                log.error("notifications", `E-Mail [${data.subject}] konnte nicht an ${data.to} versendet werden. ${error.toString()}`);
            }
    
        })
        
    } catch (error) {
        log.error("email", `sendMail: ${error.toString()}`);
        data.success(true, "");
    }


}