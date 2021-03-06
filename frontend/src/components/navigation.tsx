import React, { useEffect, useState } from 'react';
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

let isNavOpenGlobal = false;
let isClickEvent = false;

export default function (props: {
    username: string,
    role: string
}) {

    const [isNavOpen, setIsNavOpen] = useState(window.innerWidth > 500);
    const [services, setServices] = useState(([] as {
        name: string
        homepage: string
    }[]));

    useEffect(() => {

        isNavOpenGlobal = isNavOpen;


        if (!isClickEvent) {
            window.addEventListener("click", () => {
                if (isNavOpenGlobal && window.innerWidth <= 500)
                    setIsNavOpen(false);
            });
            isClickEvent = true;
        }

        //TODO: load setServices


    }, [isNavOpen]);

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
                            {services.map(e => {
                                <a href={e.homepage} target="_blank" rel="noopener noreferrer"><li>{e.name}</li></a>

                            })}
                        </>
                    </Dropmenu>

                    <Dropmenu icon="fas fa-user">
                        <>
                            <span className="title">{props.username}</span>
                            <a href={(window as any).API_BASE + "/api/v0/user/logout/"}><li>Ausloggen</li></a>
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