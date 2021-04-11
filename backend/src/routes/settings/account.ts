import { checkPassword } from "./../shared";
import { updateUserAccount, changeUsersPassword, destroyUserAccount } from "../../database/services/user";
import { checkPasswordDialog } from "../../utils/dialog"
import { SocketWithData } from "../../utils/socket";

interface IInputProblem { inputid: string, msg: string, inputValue: string }

export default (socket: SocketWithData, slog: {(msg: string): void}) => {

    socket

    .on("/settings/account/changeusername", async ( username: string, call: { (err: boolean, data?: {
        updateSucces: boolean,
        message?: string,
        problemWithInput?: IInputProblem
    } | string ): void} ) => {

        slog("API /settings/account/changeusername");

        if (!socket.user.isLoggedIn) return call(false, {
            updateSucces: false,
            message: "Nicht Angemeldet"
        });

        checkPasswordDialog(socket, "Benutzername ändern", async (status) => {

            if (!status) return call(false, {
                updateSucces: false
            });

            await updateUserAccount(socket.user.id, { username, socket }, call);
        })

    
    })

    .on("/settings/account/changepassword", async ( password: string, passwordWdh: string, call: { (err: boolean, data?: {
        updateSucces: boolean,
        message?: string,
        problemWithInput?: IInputProblem
    } | string ): void} ) => {

        slog("API /settings/account/changepassword");

        if (!socket.user.isLoggedIn) return call(false, {
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

        await changeUsersPassword(socket.user.id, { password, socket }, call);
    
    })

    .on("/settings/account/changeextendedlogstatus", async (saveLogStatus: boolean, call: { (err: boolean, data?: {
        updateSucces: boolean,
        message?: string
    } | string ): void} ) => {

        slog("API /settings/account/changeextendedlogstatus");

        if (!socket.user.isLoggedIn) return call(false, {
            updateSucces: false,
            message: "Nicht Angemeldet"
        });

        await updateUserAccount(socket.user.id, { saveLogStatus, socket }, call);
    
    }) 

    .on("/settings/account/getextendedlogstatus", async (call: {(err: boolean, extendedLogStatus: boolean):void}) => {

        slog("API /settings/account/getextendedlogstatus");

        call(false, socket.user.saveLog);

    })

    .on("/settings/account/deleteaccount", (call: {(err: boolean, success: string | boolean): void}) => {

        slog("API /settings/account/deleteaccount");
        
        checkPasswordDialog(socket, "Account löschen", async (status) => {

            if (!status) return call(false, false);

            destroyUserAccount(socket.user.id, call);
        })

    });

}