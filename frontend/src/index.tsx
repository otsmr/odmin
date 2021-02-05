import React, { useState } from 'react';
import ReactDOM from 'react-dom';

import {
    BrowserRouter as Router,
    Route, Switch, Redirect
} from "react-router-dom";

import Dialog from "./content/components/dialog"

import "./style/main.scss"

import Signin from "./sign/signin"
import Signup from "./sign/signup"
import socket from './socket';

import Navigation from "./content/components/navigation"
import Overview from "./content/pages/overview"
import Security from "./content/pages/security"
import Settings from "./content/pages/settings/index"
import Admin from "./content/pages/admin/index"
import Personalinfo from "./content/pages/personalinfo"

let intervall: any | undefined = undefined;
let lastUser: any = null;

function App () {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState({ username: "", role: "", userid: -1 });

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

    if (!intervall) {
        checkLoggedIn(true);
        intervall = setInterval(checkLoggedIn, 1000);
    }

    return (isLoading) ? null : (

        <Router >

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
                        {/* <ul className="right">
                            <li className="darklightchange" title="Dunkles Design">
                                <i className="toggle fas fa-toggle-off"></i>
                            </li>
                            <li className="blink"><i className="fas fa-plug"></i></li>
                        </ul> */}
                    </div>

                </>


            ) : (

                <Switch>                

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