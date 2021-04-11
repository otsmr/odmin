import * as moment from "moment"
import { getAllUsers } from "../../database/services/user";
import { SocketWithData } from "../../utils/socket";

interface IUser {
    id: number,
    name: string,
    enabled: boolean,
    role: string,
    createdAt: string
}

function getHumanTime (dbTime: string) {
    return moment(new Date(dbTime).getTime()).format("DD.MM.YYYY HH:mm")
}

export default (socket: SocketWithData, slog: {(msg: string): void}) => {

    socket

    .on("/admin/users/getall", async (call: {(err: boolean, allUsers?: IUser[]): void}) => {
        
        slog("API /admin/users/getall");

        const users = await getAllUsers();

        if (!users)
            return call(true);

        call(false, users.map((user: IUser) => {
            return {
                id: user.id,
                name: user.name,
                role: user.role,
                enabled: user.enabled,
                createdAt: getHumanTime(user.createdAt)
            }
        }));

    })

}