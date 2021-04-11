// -------------------------------------------
//   API: Zwei-Faktor-Authentifizierung
// -------------------------------------------

import { getUserByID, changeTwoFA } from "../../database/services/user";
import { checkPasswordDialog } from "../../utils/dialog"

import * as Speakeasy from "speakeasy";
import * as QRCode from "qrcode";
import { chunkArray } from "../../utils/utils";
import { SocketWithData } from "../../utils/socket";
interface IInputProblem { inputid: string, msg: string, inputValue: string }
interface ITwoFAData {
    enabled?: boolean,
    message?: string
    secret?: string,
    qrcode?: string
}

export default (socket: SocketWithData, slog: {(msg: string): void}) => {


    let lastTwoFaSecret = null;

    socket

    .on("/settings/twofa/getstatus", async (call: {(err: boolean, data: ITwoFAData): void}) => {

        if (!socket.user.isLoggedIn)
            return call(true, { message: "Nicht angemeldet" });

        if (socket.user.twofa)
            return call(false, { enabled: true });

        const secret = Speakeasy.generateSecret({ 
            length: 10,
            name: socket.user.name,
            issuer: "Odmin"
        });
        lastTwoFaSecret = secret.base32;

        const otpauth = `otpauth://totp/Odmin:${socket.user.name}?secret=${secret.base32}&period=30&digits=6&issuer=Odmin`;

        return QRCode.toDataURL(otpauth, (err: boolean, dataUrl: string) => {
            if (err)
                return call(true, {"message": "QRCode konnte nicht erstellt werden"});
            call(false, {
                enabled: false,
                secret: chunkArray(secret.base32, 4).join(" "),
                qrcode: dataUrl
            });
        });

    })

    .on("/settings/twofa/enabletwofa", async (twoFaCode: string, call: {(err: boolean, problemWithInput: IInputProblem | null): void}) => {

        const verified = Speakeasy.totp.verify({ 
            secret: lastTwoFaSecret,
            encoding: 'base32',
            token: twoFaCode,
            window: 2
        });
    
        if (verified) {
            await changeTwoFA(lastTwoFaSecret, socket.user.id);
            return call(false, null);
        }

        call(false, {
            inputid: "twofacode",
            inputValue: twoFaCode,
            msg: "Verifizierungscode ist falsch"
        });

    })

    .on("/settings/twofa/disable", async (call: {(err: boolean, status: boolean | string): void}) => {

        checkPasswordDialog(socket, "2FA deaktivieren", async (status) => {

            if (!status) return call(false, false);

            await changeTwoFA("", socket.user.id);
            call(false, true);

        })

    })


    

}