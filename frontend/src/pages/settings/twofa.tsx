import React, { useState, useEffect } from 'react';
import socket from '../../utils/socket';

import Toast from "../../components/toast"
import { Input, IInputProblem } from "../../components/input"

import "../../assets/style/pages/twofa.scss"


interface ITwoFAData {
    enabled: boolean,
    message?: string
    secret?: string,
    qrcode?: string
}

export default function () {

    const [twoFAData, setTwoFaData] = useState(({ enabled: true } as ITwoFAData));
    const [twoFaCode, setTwoFaCode] = useState("");
    const [toasts, setToasts] = useState([<div key="-1"></div>]);

    const [problemWithInput, setProblemWithInput] = useState({ inputid: "", msg: "", inputValue: "" });


    function checkTwoFaCode () {

        setProblemWithInput({ inputid: "", msg: "", inputValue: "" });

        socket.emit("/settings/twofa/enabletwofa", twoFaCode, (err: boolean, problemWithInput: IInputProblem | null) => {

            if (err) return console.error(err, "2FA konnte nicht eingerichtet werden");

            if (problemWithInput) {
                return setProblemWithInput(problemWithInput);
            }

            updateData();

            setToasts(toasts.concat((
                <Toast icon="check" key={Math.random()}>
                    <p>2FA wurde aktiviert</p>
                </Toast>
            )))

        })

    }

    function updateData () {

        socket.emit("/settings/twofa/getstatus", (err: boolean, data: ITwoFAData) => {
    
            if (err) return console.error(err, data.message);
    
            setTwoFaData(data);
    
        })

    }

    function disable2FA () {

        socket.emit("/settings/twofa/disable", (err: boolean, status: boolean | string) => {
            if (err) return console.error(err, status);

            if (status) {
                updateData();

                setToasts(toasts.concat((
                    <Toast icon="check" key={Math.random()}>
                        <p>2FA wurde deaktiviert</p>
                    </Toast>
                )))
            } else {
                setToasts(toasts.concat((
                    <Toast icon="warning" key={Math.random()}>
                        <p>2FA konnte nicht deaktiviert werden</p>
                    </Toast>
                )))
            }

        })

    }

    useEffect(()=>{

        updateData();

    }, [])

    return (
        <div className="content">

            {toasts}

            <h1>Zwei-Faktor-Authentifizierung</h1>

             {(twoFAData.enabled) ? (
                 <>
                    <p>2FA ist aktiviert.</p>
                    <button className="btn" onClick={disable2FA}>2FA deaktivieren</button>
                 </>
             ) : (
                 <>
                    <p>Das Einrichten der Zwei-Faktor-Authentifizierung ist einfach.</p>

                    <div>
                        <h2>1. App herunterladen</h2>
                        <ul>
                            <li>FreeOTP+ für Android</li>
                            <li>KeePassXC für Windows und Linux</li>
                            <li>Authy für iOS</li>
                        </ul>
                    </div>

                    <div className="twofa">
                        <h2>2. QR-Code mit der 2FA-App scannen</h2>
                        <div className="qrcode">

                            <div className="img">
                                <img alt="QR-Code für 2FA" src={(twoFAData.qrcode || "")} />
                            </div>
                            <div>
                                <p><b>Problem beim Scannen?</b></p>
                                <p>Schlüssel manuell eingeben</p>
                                <p className="secret">{(twoFAData.secret || "")}</p>

                                <p><b>Achtung!</b></p>
                                <p>Für den Fall eines Smartphoneverlustes<br />
                                sollte ein Backup des Schlüssels vorliegen.</p>
                            </div>

                        </div>
                    </div>

                    <div className="twofa">
                        <h2>3. Verifizierungscode</h2>
                        <div className="input-flex">
                            <Input inputid="twofacode" problemWithInput={problemWithInput} setProblemWithInput={setProblemWithInput}>
                                <input value={twoFaCode} placeholder="Verifizierungscode" className="input" type="text" onChange={e => setTwoFaCode(e.target.value)} />
                            </Input>
                            <button className="btn" onClick={checkTwoFaCode}>Weiter</button>
                        </div>
                    </div>

                 </>
             )}

        </div>
    )

}