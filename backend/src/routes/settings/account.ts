import { getUserByCookie, checkPassword } from "./../shared";
import { updateUserAccount, changeUsersPassword, destroyUserAccount } from "../../database/services/user";
import { checkPasswordDialog } from "../../utils/dialog"

interface IInputProblem { inputid: string, msg: string, inputValue: string }


export default (socket: any, slog: {(msg: string): void}) => {

    socket

    .on("/settings/account/changeusername", async ( username: string, call: { (err: boolean, data?: {
        updateSucces: boolean,
        message?: string,
        problemWithInput?: IInputProblem
    } | string ): void} ) => {

        slog("API /settings/account/changeusername");

        const user = await getUserByCookie(socket);

        if (!user) return call(false, {
            updateSucces: false,
            message: "Nicht Angemeldet"
        });

        checkPasswordDialog(socket, "Benutzername ändern", async (status) => {

            if (!status) return call(false, {
                updateSucces: false
            });

            await updateUserAccount(user.userid, { username, socket }, call);
        })

    
    })

    .on("/settings/account/changepassword", async ( password: string, passwordWdh: string, call: { (err: boolean, data?: {
        updateSucces: boolean,
        message?: string,
        problemWithInput?: IInputProblem
    } | string ): void} ) => {

        slog("API /settings/account/changepassword");

        const user = await getUserByCookie(socket);

        if (!user) return call(false, {
            updateSucces: false,
            message: "Nicht Angemeldet"
        });

        const passwordStatus = checkPassword(password, passwordWdh);

        if (passwordStatus.error) {
            return call(false, {
                updateSucces: false,
                problemWithInput: passwordStatus.problemWithInput
            }); 
        }

        await changeUsersPassword(user.userid, { password, socket }, call);
    
    })

    .on("/settings/account/changeextendedlogstatus", async (saveLogStatus: boolean, call: { (err: boolean, data?: {
        updateSucces: boolean,
        message?: string
    } | string ): void} ) => {

        slog("API /settings/account/changeextendedlogstatus");

        const user = await getUserByCookie(socket);

        if (!user) return call(false, {
            updateSucces: false,
            message: "Nicht Angemeldet"
        });

        await updateUserAccount(user.userid, { saveLogStatus, socket }, call);
    
    }) 

    .on("/settings/account/getextendedlogstatus", async (call: {(err: boolean, extendedLogStatus: boolean):void}) => {

        const user = await getUserByCookie(socket);

        if (!user) return call(true, false);

        call(false, socket.user.saveLog);

    })

    .on("/settings/account/deleteaccount", (call: {(err: boolean, success: string | boolean): void}) => {

        checkPasswordDialog(socket, "Account löschen", async (status) => {

            if (!status) return call(false, false);

            destroyUserAccount(socket.user.id, call);
        })

    });

}