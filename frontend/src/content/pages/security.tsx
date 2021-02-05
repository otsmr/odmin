import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import socket from '../../socket';
import Table from '../components/table';

export interface ISession {
    id: number,
    clientip: string;
    browser: string;
    os: string;
    plz: string,
    city: string,
    country: string,
    expiresInMoment: string;
    createdAtMoment: string;
}

export interface ISecurityData {
    dataLoaded: boolean;
    isTwoFAEnabled: boolean;
    isExtendedLogEnabled: boolean;
    webAuthnKey: number;
    sessions: ISession[];
}

export function TableSessions (props: {
    actions?: {(session: ISession): JSX.Element},
    sessions: ISession[]
}) {

    return (
        <Table
            className="small-padding"
            header={["IP-Adresse", "Standort", "Browser", "Betriebssystem", "Verfällt in", "Erstellt vor", ""]}
            data={props.sessions.map(s => [s.clientip, (s.country) ? `${s.plz } ${s.city} - ${s.country}` : "-", s.browser, s.os, s.expiresInMoment, s.createdAtMoment, (props.actions) ? props.actions(s) : ""] )}
            />
    )
}

export default function () {

    const [securityData, setSecurityData] = useState(({ 
        dataLoaded: false,
        isTwoFAEnabled: false,
        isExtendedLogEnabled: false,
        webAuthnKey: 0,
        sessions: []     
    } as ISecurityData));

    function updateData () {

        socket.emit("/security/summary", (err: boolean, data: ISecurityData ) => {
            if (err) return console.error(data);
            
            setSecurityData({
                ...data,
                dataLoaded: true
            });
            
        });
        
    }

    useEffect(()=>{
        if (!securityData.dataLoaded) updateData();
    }, [securityData.dataLoaded]);


    function deleteSession (id: number) {
        
        socket.emit("/security/sessions/delete", id, (err: boolean) => {
            if (err) return console.error("delete session");

            updateData();
            
        })

    }

    // TODO: Sessions mit verschiedenen Rechten (zB. keine Einstellungen ändern)
    // TODO: länge der Sessions

    return (
        <div className="content">

            <h1>Sicherheit</h1>
            <p>Einstellungen, um die Kontosicherheit zu erhöhen</p>

            <div className="cart">
                <div className="body">
                    <h3>Bei Odmin anmelden</h3>
                    <br />
                    <Link className="item" to="/settings/account">
                        <div>Passwort ändern</div>
                        <div></div>
                    </Link>
                    <Link className="item" to="/settings/twofa">
                        <div>2FA-Authentifizierung</div>
                        <div>{(securityData.isTwoFAEnabled) ? "aktiviert" : "nicht aktiviert"}</div>
                    </Link>
                    <Link className="item" to="/settings/account">
                        <div>Sitzungen speichern</div>
                        <div>{(securityData.isExtendedLogEnabled) ? "aktiviert" : "nicht aktiviert"} </div>
                    </Link>
                    <Link className="item" to="/settings/suspicious-behavior">
                        <div>verdächtiges Verhalten</div>
                        <div>nicht eingerichtet</div>
                    </Link>
                    <br />
                </div>
            </div>

            <div className="cart bigsize">
                <div className="body">
                    <h3>laufende Sessions</h3>
                    <br />

                    <TableSessions
                        sessions={securityData.sessions}
                        actions={s => (
                            <div className="td-actions">
                                <button className="btn warn" onClick={e => deleteSession(s.id)}><i className="fas fa-trash-alt"></i></button>
                            </div>
                        )} />


                    <br />
                </div>
            </div>
        </div>
    )

}