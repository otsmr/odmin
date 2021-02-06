import React, { useState, useEffect } from 'react';
import { cleanUsername } from '../../utils/utils';

import Modal from "../../components/modal"
import Toast from "../../components/toast"
import socket from '../../utils/socket';

import { Input, IInputProblem } from "../../components/input"

export default function (props: {
    username: string
}) {

    const [username, setUsername] = useState(props.username);
    const [password, setPassword] = useState("");
    const [passwordWdh, setPasswordWdh] = useState("");
    const [extendedLog, setExtendedLog] = useState(false);
    const [modal, setModal] = useState(<div></div>);
    const [toasts, setToasts] = useState([<div key="-1"></div>]);
    const [problemWithInput, setProblemWithInput] = useState({ inputid: "", msg: "", inputValue: "" });

    useEffect(()=>{
        
        socket.emit("/settings/account/getextendedlogstatus", (err: boolean, extendedLogStatus: boolean) => {
            if (err) return console.error(err);
            setExtendedLog(extendedLogStatus);
        })
        
    }, [extendedLog])

    function deleteAccount () {

        socket.emit("/settings/account/deleteaccount", (err: boolean, success: boolean | string) => {

            if (err) return console.error(success);

            (window as any).location.reload();

        })

    }

    function deleteAccountConfirm () {
        setModal((
            <Modal title={`Konto "${props.username}" löschen?`} footer={(
                <>
                    <button className='btn warn' onClick={deleteAccount}>Konto löschen</button>
                    <button className='btn' onClick={() => setModal((<div></div>))}>Abbrechen</button>
                </>
            )} closeModal={() => setModal((<div></div>))}>
                <div>Das Konto und alle gespeicherte Daten werden unwiderruflich gelöscht.</div>
            </Modal>
        ));
    }

    function setProblemWithInputHelper (problemWithInput: IInputProblem) {

        setProblemWithInput(problemWithInput);
        setTimeout(() => {
            (window as any).document.querySelector(".input-invalid input")?.focus()
        }, 0);

    }

    function saveUsername () {

        setProblemWithInput({ inputid: "", msg: "", inputValue: "" });

        socket.emit("/settings/account/changeusername", username, (err: boolean, data: {
            updateSucces: boolean,
            problemWithInput?: IInputProblem
        }) => {

            if (err) return console.error(err);

            if (data.problemWithInput) setProblemWithInputHelper(data.problemWithInput);

            if (data.updateSucces) {
                setToasts(toasts.concat((
                    <Toast icon="check" key={Math.random()}>
                        <p>Benutzername geändert</p>
                    </Toast>
                )))
            }

        })

    }

    function changeExtendedLogStatus () {

        socket.emit("/settings/account/changeextendedlogstatus", !extendedLog, (err: boolean, data: {
            updateSucces: boolean
        }) => {

            if (err) return console.error(err);

            if (data.updateSucces) {

                setExtendedLog(!extendedLog);

                setToasts(toasts.concat((
                    <Toast icon="check" key={Math.random()}>
                        <p>Erfolgreich geändert</p>
                    </Toast>
                )))

            }

        })

    }

    function changePassword () {

        socket.emit("/settings/account/changepassword", password, passwordWdh, (err: boolean, data: {
            updateSucces: boolean,
            problemWithInput: IInputProblem
        }) => {

            if (err) return console.error(err);

            if (data.updateSucces) {

                setPassword("");
                setPasswordWdh("");

                setToasts(toasts.concat((
                    <Toast icon="check" key={Math.random()}>
                        <p>Password wurde geändert</p>
                    </Toast>
                )))

            }

            if (data.problemWithInput) setProblemWithInput(data.problemWithInput);

        });

    }

    return (
        
        <div className="content">

            {modal}

            {toasts}

            <h1>Einstellungen</h1>
            <h2 className="subtitle">Konto-Einstellungen für {props.username}</h2>

            <button className="btn warn top-right" onClick={deleteAccountConfirm}>Konto löschen</button>

            <div className="form default">

                <h2>Benutzername</h2>
                <div className="input-flex">

                    <Input inputid="username" problemWithInput={problemWithInput} setProblemWithInput={setProblemWithInput}>
                        <input value={username} placeholder="Benutzername" className="input" type="text" onChange={e => setUsername(cleanUsername(e.target.value))} />
                    </Input>

                    {(username !== props.username) ? (
                        <button className="btn" onClick={saveUsername}>Speichern</button>
                    ) : null}

                </div>

                <br />
                <h2>Erweitertes Sicherheitsprotokoll</h2>
                <p className="label">IP-Adresse und User Agent werden zusätzlich unverschlüsselt gespeichert</p>
                <div className="formGroup">
                    <input id="extendedLogcb" type="checkbox" checked={extendedLog} onChange={changeExtendedLogStatus}  />
                    <label htmlFor="extendedLogcb">Erweitertes Sicherheitsprotokoll aktivieren</label>
                </div>

                <br />
                <h2>Passwort ändern</h2>
                <div className="input-flex" >

                    <Input inputid="password" problemWithInput={problemWithInput} setProblemWithInput={setProblemWithInput}>
                        <input className="input" type="password" value={password} placeholder="Neues Passwort" onChange={e => setPassword(e.target.value)}/>
                    </Input>

                    <Input inputid="passwordWdh" problemWithInput={problemWithInput} setProblemWithInput={setProblemWithInput}>
                        <input className="input" type="password" value={passwordWdh} placeholder="Neues Passwort wdh." onChange={e => setPasswordWdh(e.target.value)}/>
                    </Input>

                    <button className="btn" onClick={changePassword}>Passwort ändern</button>

                </div>

            </div>

        </div>

    )

}