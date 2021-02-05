
import socket from "../../socket";
import React, { useState } from "react";
import { Input, IInputProblem } from "./input";
import Modal from "./modal"

interface IDialogData {
    id: number,
    title: string,
    text: string,
    action: string,
    btnTitle?: {
        success?: string,
        cancel?: string
    },
    input?: {
        placeholder: string,
        type: string
    }
}

interface IDialog {
    data: IDialogData,
    closeDialog: {(): void}
}

function Dialog (props: IDialog) {

    const [inputValue, setInputValue] = useState("");
    const [problemWithInput, setProblemWithInput] = useState({ inputid: "", msg: "", inputValue: "" });

    function sendBack () {

        if (props.data.action) {

            switch (props.data.action) {
                case "reload": (window as any).location.reload(); break;
            }

            return;
        }

        setProblemWithInput({ inputid: "", msg: "", inputValue: "" });

        socket.emit("dialog", {
            id: props.data.id,
            inputValue
        }, (data: {success: boolean, problemWithInput?: IInputProblem}) => {

            console.log(data);

            if (data.success) return props.closeDialog();

            if (data.problemWithInput)
                setProblemWithInput(data.problemWithInput);

        });

    }

    function onKeyUp (event: React.KeyboardEvent<HTMLInputElement>) {

        if (event.keyCode === 13) sendBack();

    }

    function cancelDialog () {

        socket.emit("dialog", {
            id: props.data.id,
            canceled: true
        });
        props.closeDialog();

    }

    return (

        <Modal footer={(
            <div>
                <button className="btn" onClick={sendBack}>{props.data.btnTitle?.success || "Ok"}</button>
                <button className="btn light" onClick={cancelDialog}>{props.data.btnTitle?.cancel || "Schließen"}</button>
            </div>
        )} title={props.data.title} closeModal={cancelDialog}>
            <div>
                <p>{props.data.text}</p>
                {(props.data.input) ? (
                    <Input inputid="input" problemWithInput={problemWithInput} setProblemWithInput={setProblemWithInput}>
                        <input autoFocus value={inputValue} placeholder={props.data.input.placeholder} className="input" type={props.data.input.type} onKeyUp={onKeyUp} onChange={e => setInputValue(e.target.value)} />
                    </Input>
                ) : null}
            </div>
        </Modal>

    )

}

let isSocketListening = false;

export default function () {

    const [dialog, setDialog] = useState((<></>));

    if (!isSocketListening) {

        socket.on("dialog", (data: IDialogData) => {
    
            setDialog((
                <Dialog data={data} closeDialog={() => {setDialog((<></>))}}/>
            ));
    
        })
        isSocketListening = true;

    }

    return dialog;

}
