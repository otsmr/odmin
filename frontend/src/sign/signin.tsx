import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import "./../style/elements/form.scss"
import "./../style/pages/sign.scss"

import socket from '../socket';
import { setCookie, blurAll, getSearchLocation } from '../utils';

import { useLockedSign, IService, checkService } from "./helpers"

let checkedLocked = false;

export default function () {
    
    const [isLoading, setIsLoading] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [twofaToken, setTwofaToken] = useState("");
    const [isSigninFailed, setIsSigninFailed] = useState(false);
    const [isSignSucces, setIsSignSucces] = useState(false);
    const [showTwoFA, setShowTwoFA] = useState(false);
    const [service, setService] = useState((null as IService | null));

    useEffect(() => {
        
        checkService(setService, setIsLoading);

    }, []);

    const {
        setIsLocked,
        isLocked,
        lockedElement,
        updateLockedTime
    } = useLockedSign();

    if (!checkedLocked) {
        updateLockedTime();
        checkedLocked = true;
    }

    const checkCredential = (event: React.FormEvent | null) => {

        if (event) event.preventDefault();

        let blockLoading = false;

        setTimeout(() => {
            if (blockLoading) return;
            setIsLoading(true);
        }, 500);

        blurAll();

        const checkContinue = decodeURIComponent(getSearchLocation("continue"));

        console.log(checkContinue);

        socket.emit("/sign/checkcredential", {
            password,
            username,
            twofaToken,
            serviceid: service?.id,
            checkContinue
        }, (err: boolean, data: {
            credentialsAreOk: boolean,
            isLocked?: boolean,
            cookieToken?: string,
            continue: string,
            isWebAuthnUser?: boolean,
            isTwoFaUser?: boolean,
        }) => {
            blockLoading = true;

            setIsLoading(false);

            if (err) return console.error(err);

            if (data.isTwoFaUser && data.credentialsAreOk) {
                // Nach dem TwoFaToken
                setTimeout(() => {
                    (window as any).document.querySelector('[name="twofa"]')?.focus();
                }, 0);
                return setShowTwoFA(true);
                

            }
            if (data.isTwoFaUser && !data.credentialsAreOk) {
                //TwoFA-Code ist falsch
                
                setIsSigninFailed(true);
                setTimeout(() => {
                    setIsSigninFailed(false);
                    setTimeout(() => {
                        (window as any).document.querySelector('[name="twofa"]')?.focus();
                    }, 20);
                }, 500);
                
                return;
            }

            if (data.credentialsAreOk) {
                setCookie("token", data.cookieToken || "");
                setUsername("");
                setPassword("");

                setIsSignSucces(true);

                setTimeout(() => {
                    (window as any).location.href = data.continue;
                }, 500);

                return;
            }

            setTimeout(() => {
                (window as any).document.querySelector(".input[type=password]")?.focus()
            }, 0);

            setIsSigninFailed(true);
            setTimeout(() => {
                setIsSigninFailed(false);
            }, 500);
            
            if (data.isLocked) {
                setIsLocked(true);
            }
            
        })
        
    }

    return (
        
        <div className="signin">


            <div className={((isSigninFailed) ? "failed shake " : "") + "form default" + ((isLoading) ? " loading" : "") + ((service) ? " service" : "")}>

                {(service) ? (
                    <div className="signwith"> Über Odmin anmelden </div>
                ) : null}

                <form onSubmit={checkCredential}>

                    <div className={(showTwoFA && !isLocked) ? "privacy overlay" : "hidden"}>

                        <header>
                            <h1>Zwei-Faktor-Authentifizierung</h1>
                        </header>

                        <input value={twofaToken} className="input" type="text" placeholder="Code" name="twofa"
                            onChange={e => setTwofaToken(e.target.value)} />

                        <div className="footer">
                            <div className="btn light" onClick={_=> {setShowTwoFA(false);setTwofaToken("");}}>Abbrechen</div>
                            <div className="btn" onClick={e => checkCredential(null)}> Weiter</div>
                        </div>

                    </div>

                    {(isSignSucces && !isLocked) ? (
                        <div className="overlay">
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" width="18px" height="18px">
                                    <path d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                                </svg>
                                <p>Erfolgreich angemeldet</p>
                            </div>
                        </div>
                    ) : null}

                    <header>
                        <h1>Anmelden</h1>
                        {(service) ? (
                            <p>
                                Weiter zu <a target="_blank" rel="noopener noreferrer" href={service.homepage}>{service.name}</a>.
                            </p>
                        ) : ( <p>Mit Odmin-Konto anmelden.</p> )}
                    </header>

                    {(isLocked) ? lockedElement : (

                        <div>
                            
                            <input value={username} placeholder="Benutzername" className="input" type="text" autoFocus autoComplete="off" onChange={e => setUsername(e.target.value)}/>

                            <input value={password} placeholder="Passwort"  className="input"  type="password" onChange={e => setPassword(e.target.value)}/>

                            <div className="footer">
                                <Link className="btn light" to={`/signup${(window as any).location.search}`}>Konto erstellen</Link>
                                <button className="btn right" type="submit">Anmelden</button>
                            </div>

                        </div>

                    )}

                </form>

            </div>

            <ul>
                <a target="_blank" rel="noopener noreferrer" href="https://oproj.de/privacy"><li>Datenschutz</li></a>
                <a target="_blank" rel="noopener noreferrer" href="https://oproj.de/terms"><li>Nutzungsbedingungen</li></a>
                <a target="_blank" rel="noopener noreferrer" href="https://oproj.de/imprint"><li>Impressum</li></a>
            </ul>

        </div>

    )

}