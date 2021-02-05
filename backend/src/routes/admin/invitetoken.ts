import { getAllTokensByName, createNewToken, getToken, removeTokenById } from "../../database/services/token";
import * as moment from "moment"

interface Token {
    name: string,
    id: number,
    createdAt: string
}

interface IInputProblem { inputid: string, msg: string, inputValue: string }


export default (socket: any, slog: {(msg: string): void}) => {

    // socket.user.role

    socket
    
    .on("/admin/invtetoken/getall", async (call: {(err: boolean, allTokens?: Token[]): void}) => {
        
        slog("API /admin/invitetoken/getall");

        if (!socket.user || socket.user.role !== "admin") return call(true);

        const tokens = await getAllTokensByName("inviteToken");

        if (!tokens) return call(true);

        call(false, tokens.map(token => {
            return {
                id: token.id,
                name: token.token,
                createdAt: moment(new Date(token.createdAt).getTime()).format("DD.MM.YYYY HH:mm")
            }
        }));

    })

    .on("/admin/invitetoken/create", async (newToken: string, call: {(err: boolean, data: {
        createSucesss: boolean,
        problemMessage?: string,
        problemWithInput?: IInputProblem
    }): void}) => {

        slog("API /admin/invitetoken/create");

        
        if (!socket.user || socket.user.role !== "admin") return call(true, {
            createSucesss: false,
            problemMessage: "Keine ausreichenden Rechte"
        });

        const isToken = await getToken("inviteToken", newToken);

        if (!isToken.err && isToken.token ) return call(false, {
            createSucesss: false,
            problemWithInput: {
                inputid: "token",
                inputValue: newToken,
                msg: "Token schon vorhanden"
            }
        });

        const success = await createNewToken("inviteToken", newToken);

        if (success) return call(false, {
            createSucesss: true
        })
        
        call(false, {
            createSucesss: false,
            problemMessage: "Token konnte nicht gespeichert werden"
        });

    })

    .on("/admin/invitetoken/delete", async (tokenid: number, call: {(err: boolean): void}) => {

        slog("API /admin/invitetoken/delete");

        if (!socket.user || socket.user.role !== "admin") return call(true);

        call(!await removeTokenById(tokenid));

    })

}