
import sendMail from "./sendMail";
import { getNotificationsByUserID } from "../database/services/notifications";

import config from "../utils/config"

const secwarnTemplates = require("./templates/secwarn.json")

export default class EMailNotification {

    userid: number;
    opt: {
        email: string,
        securitystandard: boolean,
        securityextended: boolean,
        newsletter: string
    } = null;

    constructor (userid: number) {
        this.userid = userid;
    }

    async loadData (userid: number) {

        //TODO: Benachrichtigungen: Matrix, E-Mail
        const notify = await getNotificationsByUserID(userid);

        if (!notify) return this.opt = null;

        // TODO: chanel; securitystandard !== securityextended

        this.opt = {
            securitystandard: notify.securityNotifications === 1,
            securityextended: notify.securityNotifications === 2,
            newsletter: notify.newsletter,
            email: notify.email
        }

    }

    async send (type: string) {

        if (!this.opt) await this.loadData(this.userid);
        
        if (!this.opt || !secwarnTemplates[type]) return;

        const mail = secwarnTemplates[type];

        if ( this.opt.securityextended && mail.type === "extended" ) this.sendMail(mail);
        if ( this.opt.securitystandard && mail.type === "standard" ) this.sendMail(mail);

    }

    sendMail (template) {

        sendMail({
            type: template.template,
            subject: template.subject,
            to: this.opt.email,
            from: config.get("email:account"),
            replace: {
                email: this.opt.email,
                title: template.title,
                desc: template.text
            }
        });

    }

}