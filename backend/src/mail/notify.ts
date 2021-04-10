
import sendMail from "./sendMail";
import { getNotificationsByUserID } from "../database/services/notifications";

import config from "../utils/config"
import logs from "../utils/logs";

import securityTemplates from "./templates/security"

export function sendNotification (userid, type) {

    return new Promise(async (re, rj) => {

        const userOptions = await getNotificationsByUserID(userid);

        if (!userOptions)
            return re({error: false}); // no notification specified

        if (!securityTemplates[type]) {
            logs.error("notifications", `sendNotification: template "${type}" not found`);
            return;
        }

        let isSendMail = false;

        switch (userOptions.securityNotifications) {
            case 0: // disabled
                break;

            case 1: // suspicious behavior


                break;
            case 2: //always
                isSendMail = true;
        
            default:
                break;
        }

        console.log("isSendMail", isSendMail);

        if (!isSendMail) {
            return;
        }

        const template = securityTemplates[type];

        sendMail({
            type: template.template,
            subject: template.subject,
            to: userOptions.email,
            from: config.get("email:account"),
            replace: {
                email: userOptions.email,
                title: template.title,
                desc: template.text
            },
            success: () => {
                re({error: false});
            }
        });


    }).catch(e => {
        logs.error("notifications", "sendNotification: " + JSON.stringify(e));
        console.log(e);
    });

}