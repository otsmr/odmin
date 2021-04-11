
import invitetoken from "./invitetoken"
import services from "./services"
import users from "./users"
import { SocketWithData } from "../../utils/socket";

export default (socket: SocketWithData, slog: {(msg: string): void}) => {

    invitetoken(socket, slog);
    services(socket, slog);
    users(socket, slog);
    

}