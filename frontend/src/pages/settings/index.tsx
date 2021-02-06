import React from 'react';
import { Route, Switch, Redirect } from "react-router-dom";

import Account from "./account"
import Webauthn from "./webauthn"
import Twofa from "./twofa"
import Notifications from "./notifications"
import SuspiciousBehavior from "./suspiciousbehavior"

export default function (props: {
    username: string
}) {
    return (
        <Switch>

            <Route path="/settings/account">
                <Account username={props.username}/>
            </Route>
            <Route path="/settings/notifications" component={Notifications} />
            <Route path="/settings/twofa" component={Twofa} />
            <Route path="/settings/webauthn" component={Webauthn} />
            <Route path="/settings/suspicious-behavior" component={SuspiciousBehavior} />

            <Route path="*">
                <Redirect to="/settings/account"/>
            </Route>

        </Switch>
    )

}