import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import "./../assets/style/elements/form.scss"
import "./../assets/style/pages/sign.scss"

import socket from '../utils/socket';
import { blurAll, cleanUsername, getSearchLocation, setHttpOnlyCookie } from '../utils/utils';

import { checkService, IService, useLockedSign } from "./../components/LockedSign"
import { Input, IInputProblem } from "../components/input"

let checkedLocked = false;

export default function () {
    
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordWdh, setPasswordWdh] = useState("");
    const [inviteToken, setInviteToken] = useState("");
    const [problemWithInput, setProblemWithInput] = useState({ inputid: "", msg: "", inputValue: "" });
    const [isSignSucces, setIsSignSucces] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);

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

    const privacyAccepted = () => {

        setIsLoading(true);
        blurAll();

        socket.emit("/sign/privacyaccepted", (err: boolean, data: { setCookieToken: string, continue: string }) => {
            
            setIsLoading(false);
        
            if (err) return console.error("/sign/privacyaccepted", err, data);

            setIsSignSucces(true);

            setHttpOnlyCookie({setCookieToken: data.setCookieToken}, () => {
                (window as any).location.href = data.continue;
            });

        })

    }

    const checkCredential = (event: React.FormEvent) => {

        event.preventDefault();

        setIsLoading(true);
        setProblemWithInput({ inputid: "", msg: "", inputValue: "" });

        blurAll();

        const checkContinue = decodeURIComponent(getSearchLocation("continue"));

        socket.emit("/sign/checksignup", { username, password, passwordWdh, inviteToken, checkContinue, serviceid: service?.id, }, (err: boolean, data: {
            createSucces: boolean,
            problemWithInput?: IInputProblem,
            isLocked?: boolean
        }) => {

            setIsLoading(false);
            
            if (err) return console.error("/sign/checksignup", err, data);

            if (data.createSucces) {
                setUsername("");
                setPassword("");
                setInviteToken("");
                setPasswordWdh("");

                setShowPrivacy(true);

            }

            if (data.problemWithInput) {

                setProblemWithInput(data.problemWithInput);
                setTimeout(() => {
                    (window as any).document.querySelector(".input-invalid input")?.focus()
                }, 0);

            }
            
            if (data.isLocked) {
                setIsLocked(true);
            }
            
        })

    }

    return (
        
        <div className="signin">

            <div className={"form default" + ((isLoading) ? " loading" : "") + ((service) ? " service" : "")}>

                 {(service) ? (
                    <div className="signwith"> Über Odmin anmelden </div>
                ) : null}

                {(showPrivacy) ? (

                    <div className="privacy overlay">

                        <header>
                            <h1>Datenschutz</h1>
                        </header>

                        <ul>
                            <li>Es gibt kein Tracking und damit auch keine Tracking-Cookies.</li>
                            <li>Alle Daten bleiben in Deutschland.</li>
                            <li>Für die Nutzung dieses Dienstes sind keine persönlichen Daten erforderlich.</li>
                            <li>Den Quellcode gibt es auf <a target="_blank" rel="noopener noreferrer" href="https://github.com/otsmr/odmin">Github</a>.</li>
                        </ul>

                        <a target="_blank" rel="noopener noreferrer" href="https://oproj.de/privacy">Weiterlesen</a>
                        
                        <div className="footer">
                            <button className="btn light" onClick={_=> setShowPrivacy(false)}>Ablehnen</button>
                            <button className="btn" onClick={_ => privacyAccepted()}>Akzeptieren</button>
                        </div>

                    </div>

                ) : null }

                {(isSignSucces) ? (
                    <div className="overlay">
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" width="18px" height="18px">
                                <path d="M0 0h24v24H0z" fill="none"/>
                                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                            </svg>
                            <p>Erfolgreich registriert</p>
                        </div>
                    </div>
                ) : null}

                <div>
                    <header>
                        <h1>Registrieren</h1>
                        {(service) ? (
                            <p>
                                Weiter zu <a target="_blank" rel="noopener noreferrer" href={service.homepage}>{service.name}</a>.
                            </p>
                        ) : ( <p>Ein Odmin-Konto erstellen.</p> )}
                    </header>

                    {(isLocked) ? lockedElement : (

                        <form onSubmit={checkCredential}>

                            <Input inputid="username" problemWithInput={problemWithInput} setProblemWithInput={setProblemWithInput}>
                                <input value={username} placeholder="Benutzername" className="input" type="text" autoFocus autoComplete="off" onChange={e => setUsername(cleanUsername(e.target.value))} />
                            </Input>

                            <Input inputid="password" problemWithInput={problemWithInput} setProblemWithInput={setProblemWithInput}>
                                <input value={password} placeholder="Passwort" className="input"  type="password" onChange={e => setPassword(e.target.value)} />
                            </Input>
                            <Input inputid="passwordWdh" problemWithInput={problemWithInput} setProblemWithInput={setProblemWithInput}>
                                <input value={passwordWdh} placeholder="Passwort bestätigen" className="input"  type="password" onChange={e => setPasswordWdh(e.target.value)} />
                            </Input>
                            <Input inputid="inviteToken" problemWithInput={problemWithInput} setProblemWithInput={setProblemWithInput}>
                                <input value={inviteToken}  className="input" type="text" placeholder="Einladungstoken" onChange={e => setInviteToken(e.target.value)} autoComplete="off" />
                            </Input>

                            <div className="footer">
                                <Link className="btn light" to={`/signin${(window as any).location.search}`}>Anmelden</Link>
                                <button className="btn right" type="submit">Konto erstellen</button>
                            </div>

                        </form>

                    )}

                </div>

            </div>

            <ul>
                <a target="_blank" rel="noopener noreferrer" href="https://github.com/otsmr/odmin"><li>Projekt auf Github</li></a>
                <a target="_blank" rel="noopener noreferrer" href="https://oproj.de/privacy"><li>Datenschutz</li></a>
                <a target="_blank" rel="noopener noreferrer" href="https://oproj.de/imprint"><li>Impressum</li></a>
            </ul>

        </div>

    )

}