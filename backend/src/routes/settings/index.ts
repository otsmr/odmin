
import account from "./account"
import notifications from "./notifications"
import twofa from "./twofa"
import { SocketWithData } from "../../utils/socket";

export default (socket: SocketWithData, slog: {(msg: string): void}) => {

    account(socket, slog);
    notifications(socket, slog);
    twofa(socket, slog);

}