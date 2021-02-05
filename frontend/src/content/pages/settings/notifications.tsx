import React, { useState, useEffect } from 'react';
import socket from '../../../socket';

import { Input, IInputProblem } from "../../components/input"
import Select from "../../components/select"
import Toast from "../../components/toast"

import "../../../style/elements/radio.scss"

interface ApiData {
    email: string,
    matrixid: string,
    telegramid: string,
    newsletter: boolean,
    securityNotifications: number,
    dataLoaded: boolean,
    updating: boolean,
    chanels: {
        securityNotifications: string,
        newsletter: string
    }
}

function NotificationsChanels (props: {
    title: string,
    value: string,
    onChange: {(newValue: string | null): void}
}) {

    const [chanels, setChanels] = useState(([] as {
        title: string,
        value?: string
    }[]));

    useEffect(()=>{

        socket.emit("/settings/notifications/load", (err: boolean, data: ApiData | null) => {
            if (err) return console.error(err);

            const options = [];

            if (data) {
                if (data.email !== "") options.push({
                    title: "E-Mail",
                    value: "email"
                })
                if (data.matrixid !== "") options.push({
                    title: "Matrix",
                    value: "matrix"
                })
                if (data.telegramid !== "") options.push({
                    title: "Telegram",
                    value: "telegram"
                })
            }

            if (options.length === 0) options.push({
                title: "Kein Kanal hinterlegt"
            }) 

            setChanels(options);
        
        })

    }, [])

    return (
        <Select title={props.title} options={chanels} value={props.value} onChange={props.onChange} />
    )

}

export default function () {

    const [email, setEmail] = useState("");

    const [lastData, setLastData] = useState(({
        email: "",
        matrixid: "",
        telegramid: "",
        newsletter: false,
        securityNotifications: 0,
        dataLoaded: false,
        updating: false,
        chanels: {
            securityNotifications: "",
            newsletter: "",
        }
    } as ApiData));

    const [matrixid, setMatrixid] = useState("");
    const [telegramid, setTelegramid] = useState("");
    const [toasts, setToasts] = useState([<div key="-1"></div>]);

    const [newsletter, setNewsletter] = useState(false);
    const [newsletterChanel, setNewsletterChanel] = useState("");
    const [securityNotifications, setSecurityNotifications] = useState(0);
    const [securityNotificationsChanel, setSecurityNotificationsChanel] = useState("");

    const [problemWithInput, setProblemWithInput] = useState({ inputid: "", msg: "", inputValue: "" });

    function displayToast (status: boolean) {
        
        if (status) {
            setToasts(toasts.concat((
                <Toast icon="check" key={Math.random()}>
                    <p>Änderungen wurden übernommen</p>
                </Toast>
            )))
        } else {
            setToasts(toasts.concat((
                <Toast icon="warning" key={Math.random()}>
                    <p>Änderungen wurden nicht übernommen</p>
                </Toast>
            )))
        }
        updateData();

    }

    function updateData () {

        setLastData({...lastData, dataLoaded: true, updating: true});

        socket.emit("/settings/notifications/load", (err: boolean, data: ApiData | null) => {
            if (err) return console.error(err);

            if (!data) {
                return setLastData({...lastData, dataLoaded: true, updating: false});
            }

            setLastData({...data, dataLoaded: true, updating: true});
            
            setEmail(data.email);
            setMatrixid(data.matrixid);
            setTelegramid(data.telegramid);
            setNewsletter(data.newsletter);
            setSecurityNotifications(data.securityNotifications);
            setNewsletterChanel(data.chanels.newsletter);
            setSecurityNotificationsChanel(data.chanels.securityNotifications);

            setLastData({...data, dataLoaded: true, updating: false});


        })

    }

    function updateCommunicationType (type: string) {

        const data: {
            email?: string,
            matrixid?: string,
            telegramid?: string
        } = {}

        if (type === "email" && email !== lastData.email) data.email = email;
        if (type === "matrix" && matrixid !== lastData.matrixid) data.matrixid = matrixid;
        if (type === "telegram" && telegramid !== lastData.telegramid) data.telegramid = telegramid;

        socket.emit("/settings/notifications/updatecommunicationtypes", data, (err: boolean, data: {
            problemWithInput?: IInputProblem,
            updateSuccess: boolean
        }) => {
            if (err) return console.error(data);
            if (data.problemWithInput) setProblemWithInput(data.problemWithInput);
            else displayToast(data.updateSuccess);
        })

    }
    useEffect(()=>{
        
        if (lastData.updating) return;
        
        if (!lastData.dataLoaded) updateData();
        else if (lastData.newsletter !== newsletter || lastData.securityNotifications !== securityNotifications) {
            socket.emit("/settings/notifications/updatetypes", {
                newsletter,
                securityNotifications
            }, (err: boolean, status: boolean) => {
                if (err) return console.error(err);
                displayToast(status);
            })
        }
        else if (lastData.chanels.newsletter !== newsletterChanel || lastData.chanels.securityNotifications !== securityNotificationsChanel) {
            socket.emit("/settings/notifications/updatechanel", {
                newsletterChanel,
                securityNotificationsChanel
            }, (err: boolean, data: {updateSuccess: boolean}) => {
                if (err) return console.error(err);
                displayToast(data.updateSuccess);
            })
        }
        
    // eslint-disable-next-line
    }, [ newsletter, securityNotifications, lastData, newsletterChanel, securityNotificationsChanel ])
    
    return (
        <div className="content">

            {toasts}

            <h1>Benachrichtigungen</h1>

            <br />
            <h2>Kanäle</h2>

            <div className="collection">
                <div className="cart padding">

                    <p className="title">E-Mail</p>
                    <div className="input-flex">
                        <Input inputid="email" problemWithInput={problemWithInput} setProblemWithInput={setProblemWithInput}>
                            <input placeholder="E-Mail-Adresse" value={email} className="input" type="text" onChange={e => setEmail(e.target.value)} />
                        </Input>
                        {(email !== lastData.email) ? (
                            <button className="btn" onClick={e => updateCommunicationType("email")}>Bestätigen</button>
                        ) : null}
                    </div>
                </div>

                <div className="cart padding">

                    <p className="title">Matrix</p>
                    <div className="input-flex">
                        <Input inputid="matrixid" problemWithInput={problemWithInput} setProblemWithInput={setProblemWithInput}>
                            <input placeholder="@tsmr:matrix.org" value={matrixid} className="input" type="text" onChange={e => setMatrixid(e.target.value)} />
                        </Input>
                        {(matrixid !== lastData.matrixid) ? (
                            <button className="btn" onClick={e => updateCommunicationType("matrix")}>Bestätigen</button>
                        ) : null}
                    </div>
                </div>

                <div className="cart padding">

                    <p className="title">Telegram</p>
                    <div className="input-flex">
                        <Input inputid="telegramid" problemWithInput={problemWithInput} setProblemWithInput={setProblemWithInput}>
                            <input placeholder="Nummer" value={telegramid} className="input" type="text" onChange={e => setTelegramid(e.target.value)} />
                        </Input>
                        {(telegramid !== lastData.telegramid) ? (
                            <button className="btn" onClick={e => updateCommunicationType("telegram")}>Bestätigen</button>
                        ) : null}

                    </div>

                </div>

            </div>
            <br />
            <div className="collection big">

                <div>
                    <h2>Sicherheit</h2>

                    <div className="radio-group">
                        <div className="radio-item">
                            <div className="title">Kanal</div>
                            <NotificationsChanels title="Bitte auswählen" value={securityNotificationsChanel} onChange={newValue => setSecurityNotificationsChanel(newValue || "")}/>
                        </div>
                        <hr />
                        <div className="radio-item">
                            <div className="title">Deaktiviert</div>
                            <div className="radio-input">
                                <input name="notifications" id="2820424" type="radio" checked={securityNotifications === 0} onChange={e => setSecurityNotifications(0)} />
                                <label htmlFor="2820424"> Keine Sicherheitsbenachrichtigungen</label>
                            </div>
                        </div>
                        <div className="radio-item">
                            <div className="title">Standard</div>
                            <div className="radio-input">
                                <input name="notifications" id="cb654dfsd6" type="radio" checked={securityNotifications === 1} onChange={e => setSecurityNotifications(1)}/>
                                <label htmlFor="cb654dfsd6"> Nur bei verdächtigem Verhalten melden </label>
                            </div>
                            <div className="desc">- Standort beim Einloggen (Erweitertes Sicherheitsprotokoll muss aktiviert sein)</div>
                            <div className="desc">- Neuer Schlüssel für WebAuthn hinzugefügt</div>
                        </div>
                        <div className="radio-item">
                            <div className="title">Erweitert</div>
                            <div className="radio-input">
                                <input name="notifications" id="cb654dfsdfsd6" type="radio" checked={securityNotifications === 2} onChange={e => setSecurityNotifications(2)}/>
                                <label htmlFor="cb654dfsdfsd6"> Bei jedem Login oder Änderungen in den Einstellungen</label>
                            </div>
                        </div>

                    </div>

                </div>

                <div>
                    <h2>Sonstiges</h2>
                    <div className="radio-group">
                        <div className="radio-item">
                            <div className="title">Kanal</div>
                            <NotificationsChanels title="Bitte auswählen" value={newsletterChanel} onChange={newValue => setNewsletterChanel(newValue || "")}/>
                        </div>
                        <hr />
                        <div className="radio-item">
                            <div className="title">News & Updates</div>
                            <div className="radio-input">
                                <input id="cb65sfd546" type="checkbox" checked={newsletter} onChange={e => setNewsletter(e.target.checked)} />
                                <label htmlFor="cb65sfd546"> E-Mail-Benachrichtigung bei Neuerungen oder Ankündigungen</label>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            

        </div>

    )

}