
import invitetoken from "./invitetoken"
import services from "./services"
import users from "./users"

export default (socket: any, slog: {(msg: string): void}) => {

    invitetoken(socket, slog);
    services(socket, slog);
    users(socket, slog);
    

}