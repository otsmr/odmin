
import { checkUserPassword } from "../database/services/user";

interface INext {
    (
        data: {
            success: boolean,
            problemWithInput?: { inputid: string, msg: string, inputValue: string }
        }
    ): void
}

const dialog = (socket: any, data: {
    title: string,
    text?: string,
    action?: string,
    input?: {
        placeholder: string,
        type: string
    },
    btnTitle?: {
        success?: string,
        cancel?: string
    },
    onSuccess?: { (next: INext, inputValue: string) },
    onCancel?: { (): void }
}) => {

    const id = Math.round(Math.random() * 5000);

    socket.emit("dialog", { ...data, id });

    socket.on("dialog", (response: { id: number, canceled?: boolean, inputValue?: string }, next: INext) => {

        if (response.id !== id) return;

        if (response.canceled) {
            if (data.onCancel) data.onCancel();
            return;
        }
        
        if (data.onSuccess) return data.onSuccess(next, response.inputValue);
        
        next({
            success: true
        });

    });

}

export const confirm = (socket: any, data: {
    title: string,
    text: string,
    onSuccess: { (): void },
    onCancel?: { (): void },
    btnTitel?: {
        success?: string,
        cancel?: string
    }
}) => {

    dialog(socket, {
        ...data,
        onSuccess: (next) => {
            next({
                success: true
            });
            data.onSuccess();
        }
    });

}

export const prompt = (socket: any, data: {
    title: string,
    text: string,
    input: {
        placeholder: string,
        type: string
    },
    onSuccess: {(next: INext, inputValue: string)},
    onCancel?: { (): void }
}) => {

    dialog(socket, {
        ...data,
        btnTitle: {
            success: "OK",
            cancel: "Abbrechen"
        }
    });

}

export const alert = (socket: any, data: {
    title: string,
    text: string,
    action?: string,
    btnTitel?: {
        success?: string,
        cancel?: string
    }
}) => {

    dialog(socket, data);

}


export const checkPasswordDialog = (socket: any, title: string, call: { (status: boolean): void }) => {

    dialog(socket, {
        title: "Autorisieren: " + title,
        input: {
            placeholder: "Password eingeben",
            type: "password"
        },
        btnTitle: {
            success: "Weiter",
            cancel: "Abbrechen"
        },
        onSuccess: async (next: INext, password: string) => {

            const verified = await checkUserPassword(socket.user.id, password)

            if (verified) {
                next({ success: true });
                return call(true);
            }
        
            next({ success: false, problemWithInput: {
                inputValue: password,
                inputid: "input",
                msg: "Falsches Passwort"
            }});

        },
        onCancel: () => {
            call(false);
        }

    });

}