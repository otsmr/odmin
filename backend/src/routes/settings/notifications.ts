// -------------------------------------------
//  API: Benachrichtigungen
// -------------------------------------------

import { getNotificationsByUserID, updateNotifications } from "../../database/services/notifications";
import { checkPasswordDialog, alert, prompt } from "../../utils/dialog";

import { validateEmail } from "../../utils/utils";
import sendMail from "../../mail/sendMail";
import config from "../../utils/config";
import { strict } from "assert";

interface IInputProblem { inputid: string, msg: string, inputValue: string }
interface ApiData {
    email: string,
    newsletter: boolean,
    securityNotifications: number,
    chanels: {
        securityNotifications: string,
        newsletter: string
    }
}

export default (socket: any, slog: {(msg: string): void}) => {

    socket

    .on("/settings/notifications/load", async (call: {(err: boolean, data: ApiData):void}) => {

        slog("API /settings/notifications/load");

        const notify = await getNotificationsByUserID(socket.user.id);

        if (!notify) return call(false, null);
 
        call(false, {
            email: notify.email || "",
            newsletter: notify.newsletter || false,
            securityNotifications: notify.securityNotifications || 0,
            chanels: {
                securityNotifications: notify.securityNotificationsChanel || "",
                newsletter: notify.newsletterChanel || "",
            }
        })
        
    })

    .on("/settings/notifications/updatechanel", async (data: {
        newsletterChanel: string,
        securityNotificationsChanel: string
    }, call: {(err: boolean, data: {
        updateSuccess: boolean
    }):void }) => {

        slog("API /settings/notifications/updatechanel");


        const notify = await getNotificationsByUserID(socket.user.id);

        if (!notify) return call(false, {
            updateSuccess: false
        });

        let updateData = {
            checkPass: false,
            db: {}
        }

        if (notify.newsletterChanel !== data.newsletterChanel) {
            updateData.db = {
                newsletterChanel: data.newsletterChanel
            }
        } else if (notify.securityNotificationsChanel !== data.securityNotificationsChanel) {
            updateData.checkPass = data.securityNotificationsChanel === "";
            updateData.db = {
                securityNotificationsChanel: data.securityNotificationsChanel
            }
        } else return call(false, {
            updateSuccess: true
        });

        if (updateData.checkPass) {

            checkPasswordDialog(socket, "Kanal entfernen", async (status: boolean) => {
        
                if (!status) return call(false, {
                    updateSuccess: false
                });

                await updateNotifications(socket.user.id, updateData.db);

                call(false, {
                    updateSuccess: true
                });
            
            })

        } else {
            await updateNotifications(socket.user.id, updateData.db);
            call(false, {
                updateSuccess: true
            });
        }




    })
    
    .on("/settings/notifications/updatecommunicationtypes", (data: {
        email?: string
    }, call: {(err: boolean, data?: {
        problemWithInput?: IInputProblem,
        updateSuccess: boolean
    }): void}) => {

        slog("API /settings/notifications/updatecommunicationtypes");

        if (data.email !== "" && !validateEmail(data.email)) {
            return call(false, {
                updateSuccess: false,
                problemWithInput: {
                    inputValue: data.email,
                    inputid: "email",
                    msg: "Keine gültige E-Mail"
                }
            });
        }

        checkPasswordDialog(socket, "E-Mail-Adresse ändern", async (status: boolean) => {
        
            if (!status) return call(false, {
                updateSuccess: false
            });

            if (data.email === "") {
                await updateNotifications(socket.user.id, {
                    email: data.email
                });
                return call(false, {
                    updateSuccess: true
                });
            }

            const code = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);

            if (config.get("runmode") === "development") {
                console.log("E-Mail-Code: ", code);
            }

            sendMail({
                type: "newEmailAddress",
                subject: "E-Mail-Adresse bestätigen",
                to: data.email,
                from: config.get("email:account"),
                replace: {
                    newMail: data.email,
                    code
                },
                success: (err) => {
                    
                    if (err) {
                        alert(socket, {
                            title: "Fehler: E-Mail nicht versendet",
                            text: "Es konnte keine Bestätigungs-E-Mail versendet werden. Bitte E-Mail-Adresse überprüfen."
                        });
                        return call(true, { updateSuccess: false });
                    }

                    prompt(socket, {
                        title: "E-Mail-Adresse bestätigen",
                        text: "",
                        input: {
                            placeholder: "Bestätigungscode",
                            type: "text"
                        },
                        onCancel: () => {
                            call(false, {
                                updateSuccess: false
                            });
                        },
                        onSuccess: async (next, insertCode: string) => {
                            if (code === parseInt(insertCode)) {
                                await updateNotifications(socket.user.id, {
                                    email: data.email
                                });
                                call(false, {
                                    updateSuccess: true
                                });
                                next({success: true})
                            } else {
                                next({success: false,
                                    problemWithInput: {
                                        inputid: "input",
                                        inputValue: insertCode,
                                        msg: "Der Bestätigungscode ist falsch"
                                    }
                                })
                            }
                        }
                    })
                }
            })
        })
    })
    
    .on("/settings/notifications/updatetypes", async (data: {
        newsletter: boolean,
        securityNotifications: number
    }, call: {(err: boolean, status: boolean): void }) => {
        
        slog("API /settings/notifications/updatetypes");

        const notify = await getNotificationsByUserID(socket.user.id);

        if (notify && notify.securityNotifications > data.securityNotifications) {

            checkPasswordDialog(socket, "Sicherheitsbenachrichtigungen herunterstufen", async (success: boolean) => {

                if (success) {
                    await updateNotifications(socket.user.id, data);
                    call(false, true);
                }
                else call(false, false);

            })
            
        } else {
            await updateNotifications(socket.user.id, data);
            call(false, true);
        }
        
    })

}