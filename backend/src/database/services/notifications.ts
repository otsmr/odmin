
import { Notifications, User } from "../initdb"

import log from "../../utils/logs"

export const getNotificationsByUserID = async (userid: number) => {

    try {

        const notify = await Notifications.findAll({ where: { user_id: userid } });
        if (notify.length === 1) {
            return notify[0];
        }

    } catch (error) {
        log.error("database", `getNotificationsByUserID: ${error.toString()}`);
    }
    return null;

}


export const updateNotifications = async (userid: number, data: {
    email?: string,
    newsletter?: boolean,
    securityNotifications?: number,
    newsletterChanel?: string,
    securityNotificationsChanel?: string
}) => {

    try {
        
        const user = await User.findByPk(userid);
        if (user.length === 0) return false;

        let notify = await user.getNotifications();

        if (notify.length === 0) {
            console.log("Create", userid);
            await Notifications.create({
                ...data,
                user_id: userid
            });
        } else {
            await Notifications.update(data, {
                where: {
                    user_id: user.id
                }
            });
        }
        return true;
        
    } catch (error) {
        log.error("database", `updateNotifications: ${error.toString()} `);
    }

    return false;

}