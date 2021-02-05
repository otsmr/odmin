
import account from "./account"
import notifications from "./notifications"
import twofa from "./twofa"

export default (socket: any, slog: {(msg: string): void}) => {

    account(socket, slog);
    notifications(socket, slog);
    twofa(socket, slog);

}