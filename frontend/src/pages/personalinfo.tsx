import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import socket from '../utils/socket';
import { downloadFile } from '../utils/utils';

import { ISession, ISecurityData } from "./security"

export default function (props: {
    userid: number,
    username: string
}) {

    const [userData, setUserData] = useState({ 
        dataLoaded: false,
        email: "",
        lastSession: ({ 
            id: 0,
            clientip: "",
            browser: "",
            os: "",
            plz: "",
            city: "",
            country: "",
            createdAtMoment: "",
            expiresInMoment: ""
        } as ISession) 
    });

    function downloadInfos () {

        socket.emit("/security/summary", (err: boolean, securityData: ISecurityData ) => {
            if (err) return console.error(securityData);
            
            
            const data = {
                id: props.userid,
                username: props.username,
                isTwoFAEnabled: securityData.isTwoFAEnabled,
                ...userData,
                sessions: securityData.sessions
            }
    
            downloadFile(`datenabzug-${props.username}.json`, JSON.stringify(data, null, 4), "application/json")
            
        });


    }
    
    if (!userData.dataLoaded) {

        socket.emit("/personalinfo/summary", (err: boolean, data: { email: string, lastSession: ISession }) => {
            if (err) return console.error(data);

            setUserData({
                ...data,
                dataLoaded: true
            });

        });

    }

    return (
        <div className="content">
            <h1>Persönliche Daten</h1>
            <p>Zusammenfassung aller bei Odmin gespeicherten personenbezogenen Daten</p>

            <div className="collection carts">

                <div className="cart">
                    <div className="body">
                        <div className="text">
                            <h3>Profil und Kontaktdaten</h3>
                            <br />
                            <Link className="item" to="/settings/account">
                                <div>Benutzer-ID</div>
                                <div>{props.userid}</div>
                            </Link>
                            <Link className="item" to="/settings/account">
                                <div>Name</div>
                                <div>{props.username}</div>
                            </Link>
                            <Link className="item" to="/settings/notifications">
                                <div>E-Mail-Adresse</div>
                                <div>{(userData.email === "") ? "Nicht angegeben" : userData.email}</div>
                            </Link>
                            <br />
                        </div>
                    </div>
                    <div className="footer" onClick={downloadInfos}>
                        Informationen herunterladen
                    </div>
                </div>
                <div className="cart">
                    <div className="body">
                        <div className="text">
                            <h3>Aktuelle Session</h3>
                            <br />
                            <Link className="item" to="/security">
                                <div>IP-Adresse</div>
                                <div>{userData.lastSession.clientip}</div>
                            </Link>
                            <Link className="item" to="/security">
                                <div>Browser</div>
                                <div>{userData.lastSession.browser}</div>
                            </Link>
                            <Link className="item" to="/security">
                                <div>Betriebssystem</div>
                                <div>{userData.lastSession.os}</div>
                            </Link>
                            <Link className="item" to="/security">
                                <div>Standort</div>
                                <div>{userData.lastSession.plz} {userData.lastSession.city}<br /> {userData.lastSession.country}</div>
                            </Link>
                            <Link className="item" to="/security">
                                <div>Erstellt</div>
                                <div>{userData.lastSession.createdAtMoment}</div>
                            </Link>
                            <br />
                        </div>
                    </div>
                    <Link className="footer" to="/security">
                        Alle Sessions
                    </Link>
                    <Link className="footer" to="/settings/account">
                        Erweitertes Sicherheitsprotokoll
                    </Link>
                </div>


            </div>
        </div>

    )

}