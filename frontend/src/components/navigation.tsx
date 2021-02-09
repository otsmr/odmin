import React, { useState } from 'react';
import { Link, Route } from 'react-router-dom';

import logo from "../assets/img/logo.svg";

import "../assets/style/component/aside.scss"
import "../assets/style/component/navigation.scss"

const navlinks: any = {
    "" : [
        { title: "Übersicht", link: "/overview"},
        { title: "Persönliche Daten", link: "/personalinfo"},
        { title: "Sicherheit", link: "/security"},
        { title: "Einstellungen", link: "/settings/account" },
        { title: "Administrator", link: "/admin/dashboard", role: "admin" },
    ],
    "/settings" : [
        { title: "Einstellungen", className: "title disable" },
        { title: "Startseite", link: "/overview", className: "noaktiv" },
        { title: "Konto-Einstellungen", link: "/settings/account" },
        { title: "Benachrichtigungen", link: "/settings/notifications" },
        { title: "Zwei-Faktor-Authentifizierung", link: "/settings/twofa" },
        { title: "WebAuthn", link: "/settings/webauthn" },
        { title: "verdächtiges Verhalten", link: "/settings/suspicious-behavior" }
    ],
    "/admin": [
        { title: "Administrator", className: "title disable" },
        { title: "Startseite", link: "/overview", className: "noaktiv" },
        { title: "Dashboard", link: "/admin/overview", role: "admin" },
        { title: "Benutzer", link: "/admin/users", role: "admin" },
        { title: "Newsletter", link: "/admin/newsletter", role: "admin" },
        { title: "Services", link: "/admin/services", role: "admin"},
        { title: "Einladungstoken", link: "/admin/invitetoken", role: "admin"},
    ],
    "/admin/users": [
        { title: "Administrator > Benutzer", className: "title disable" },
        { title: "Zurück", link: "/admin/users", className: "noaktiv" }
    ]
};


function Dropmenu (props: {
    icon: string,
    children: any
}) {

    return (

        <li className="dropmenu" onClick={(e: any) => e.currentTarget?.classList?.toggle("open")}>
            <i className={props.icon}></i>
            <ul className="menu" onMouseLeave={(e: any) =>  e.currentTarget?.parentElement.classList?.toggle("open")}>
                {props.children}
            </ul>
        </li>

    )

}

export default function (props: {
    username: string,
    role: string
}) {

    const [isNavOpen, setIsNavOpen] = useState(true);

    let logoutToken = "";

    try {
        //TODO: token will be an HttpOnly token...
        logoutToken =  JSON.parse(atob(document.cookie.split("=")[document.cookie.split("=").indexOf("token")+1].split(".")[1])).session_token;
    } catch (error) {
        
    }

    return (
        <>
            <div className="aside">

                <div className="logo">
                    <img src={logo} width="100%" alt="Logo" />
                </div>

                <ul className="top">
                    <li title="Menü umschalten" className="dropmenu" onClick={e => setIsNavOpen(!isNavOpen)}><i className={((isNavOpen) ? "fas" : "far") + " fa-list-alt"}></i></li>
                </ul>

                <ul className="bottom">

                    <Dropmenu icon="fas fa-layer-group">
                        <>
                            <span className="title">Anwendungen</span>
                            <a href="https://otizen.de" target="_blank" rel="noopener noreferrer"><li>verschlüsselte Notizen</li></a>
                            <a href="https://oabos.de" target="_blank" rel="noopener noreferrer"><li>anonyme Abos</li></a>
                            <a href="https://osurl.de" target="_blank" rel="noopener noreferrer"><li>Kurz-URL-Dienst</li></a>
                        </>
                    </Dropmenu>

                    <Dropmenu icon="fas fa-user">
                        <>
                            <span className="title">{props.username}</span>
                            <a href={(window as any).CONFIG.apibase + "/api/v0/user/logout/" + logoutToken}><li>Ausloggen</li></a>
                        </>
                    </Dropmenu>


                </ul>

            </div>

            <div className={"navigation" + ((isNavOpen) ? " open" : "")}>

                <header>
                    <h3>Odmin</h3>
                    <h1>Kontoverwaltung</h1>
                </header>

                <div className="links">
                
                    <ul>

                        <Route path="*" children={(match) => {

                            const pathname = match.location.pathname.slice(0, match.location.pathname.lastIndexOf("/"));

                            const links = navlinks[pathname];

                            return (
                                <>
                                    {links?.map((navlink: { title: string, link?: string, role?: string, className?: string }, index: number) => {
                                        if (navlink.role && navlink.role !== props.role) return null;
                                        navlink.className = " " + (navlink.className || "");
                                        return (navlink.link) ? (
                                            <Link key={index} to={navlink.link}>
                                                <li className={((match.location.pathname === navlink.link) ? "aktiv" : "") + navlink.className}>{navlink.title}</li>
                                            </Link>
                                        ) : (
                                            <div key={index}>
                                                <li className={((match.location.pathname === navlink.link) ? "aktiv" : "") + navlink.className}>{navlink.title}</li>
                                            </div>
                                        )
                                    })}
                                </>
                            )

                             }}
                          />

                    </ul>
                    
                </div>

            </div>


        </>
    )

}