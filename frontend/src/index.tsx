import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import {
    BrowserRouter as Router,
    Route, Switch, Redirect
} from "react-router-dom";

import Dialog from "./components/dialog"

import "./assets/style/main.scss"

import Signin from "./pages/signin"
import Signup from "./pages/signup"
import socket from './utils/socket';

import Navigation from "./components/navigation"
import Overview from "./pages/overview"
import Security from "./pages/security"
import Settings from "./pages/settings/index"
import Admin from "./pages/admin/index"
import Personalinfo from "./pages/personalinfo"
import Setup from './pages/Setup';

let intervall: any | undefined = undefined;
let lastUser: any = null;

function App () {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState({ username: "", role: "", userid: -1 });
    const [isSockedConnected, setIsSockedConnected] = useState(true);

    const checkLoggedIn = (firstCheck: boolean = false) => {
        
        socket.emit("/sign/isloggedin", (err: boolean, isLoggedInNew: boolean, newUser: { username: string, role: string, userid: number }) => {
            if (err) return console.error(err);
            
            if (JSON.stringify(lastUser) === JSON.stringify(newUser) && !firstCheck) return;
            if (isLoggedInNew) setUser(newUser);
            lastUser = newUser;

            setIsLoggedIn(isLoggedInNew);
            if (firstCheck) setIsLoading(false);

            // Nur, wenn der Benutzer schon angemeldet ist
            if (!isLoggedInNew && firstCheck) {
                clearInterval(intervall);
            }
    
        })

    }

    let location = (window as any).location;


    useEffect(() => {

        socket.on("disconnect", (_: any) => setIsSockedConnected(false));
        socket.on("connect", (_: any) => setIsSockedConnected(true));

        socket.on("redirect-to-setup", () => {
            if (location.pathname !== "/setup") {
                location.href = (window as any).API_BASE + "/setup"
            }
        })

    }, [])

    if (!intervall) {
        checkLoggedIn(true);
        intervall = setInterval(checkLoggedIn, 10000);
    }

    // redirect api calls in dev 
    if (location.hostname === "localhost" && location.pathname.startsWith("/api")) {
        location.href = location.href.replace(location.protocol + "//" + location.host, (window as any).API_BASE);
        return null;
    }

    return (isLoading) ? null : (

        <Router>

            <Dialog />

            {(isLoggedIn) ? (

                <>
                    <div className="main">

                        <Navigation username={user.username} role={user.role} />

                        <Switch>

                            <Route path="/overview" exact >
                                <Overview username={user.username} />
                            </Route>
                            <Route path="/settings" >
                                <Settings username={user.username} />
                            </Route>
                            <Route path="/security" component={Security}/>
                            <Route path="/personalinfo">
                                <Personalinfo username={user.username} userid={user.userid} />
                            </Route>
                            <Route path="/admin" component={Admin}/>
                            
                            <Route path="*">
                                <Redirect to="/overview"/>
                            </Route>

                        </Switch>

                    </div>

                    <div className="footer">
                        <ul className="right">
                            <li className={(isSockedConnected) ?  "" : "blink" } title={(isSockedConnected) ?  "Mit dem Server verbunden" : "Verbindung zum Server getrennt" }><i className="fas fa-plug"></i></li>
                        </ul>
                    </div>

                </>


            ) : (

                <Switch>                

                    <Route path="/setup" component={Setup} />
                    <Route path="/signin" component={Signin} />
                    <Route path="/signup" component={Signup} />
                    <Route path="*">
                        <Redirect to={`/signin?continue=${encodeURIComponent((window as any).location.href)}`}/>
                    </Route>

                </Switch>

            )}

        </Router>

    );

}

ReactDOM.render(<App />, document.getElementById('root'));