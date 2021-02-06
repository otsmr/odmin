import React from 'react';
import { Route, Switch, Redirect } from "react-router-dom";

import Overview from "./overview"
import Invitetoken from "./invitetoken"
import Services from "./services"
import Newsletter from "./newsletter"
import Users from "./users"

export default function () {
    return (
        <Switch>

            <Route path="/admin/overview" component={Overview} />
            <Route path="/admin/services" component={Services} />
            <Route path="/admin/users" component={Users} />
            <Route path="/admin/invitetoken" component={Invitetoken} />
            <Route path="/admin/newsletter" component={Newsletter} />

            <Route path="*">
                <Redirect to="/admin/overview"/>
            </Route>

        </Switch>
    )

}