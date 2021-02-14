const router = require('express').Router();

import { getServiceBySecret, getServiceByServiceId } from "../database/services/service";
import { disableSessionByToken, getSessionByToken } from "../database/services/session";
import { getToken } from "../database/services/token";
import { getUserByID } from "../database/services/user";
import { IAPI_EROR_MESSAGE } from "../interfaces/api-response"
import config from "../utils/config";


async function handleLogout (sessiontoken: string, serviceid: string | null = null): Promise<string> {

    let redirectTo = config.get("frontend-base-url");

    let sucess = await disableSessionByToken(sessiontoken);

    if (serviceid) {

        let service = await getServiceByServiceId(serviceid);

        if (service) {
            redirectTo = service.returnto;
        }

    }

    return redirectTo + "?logout=" + ((sucess) ? 1 : 0);


}

router.post("/service/getuserfromtoken", async (req: any, res: any, next: any) => {

    if (!req.body.token || !req.body.secret) {
        return next();
    }

    const service = await getServiceBySecret(String(req.body.secret));
    if (!service)
        return next();

    let sessionToken = await getToken("oauth-session-token", String(req.body.token));
    if (sessionToken.err || !sessionToken.token)
        return next();

    if (!sessionToken.token.value.startsWith(service.serviceID + "::"))
        return next();

    let token = sessionToken.token.value.split("::")[1];

    const session = await getSessionByToken(token);
    if (!session)
        return next();

    if (!session.valid)
        return next();

    const user = await getUserByID(session.user_id);
    if (!user)
        return next();
        
    res.setHeader('Content-Type', 'application/json');

    return res.send(JSON.stringify({
        user_id: session.user_id,
        user_name: user.name
    }))

})

router.post("/service/getsessionfromcode", async (req: any, res: any, next: any) => {

    if (!req.body.code || !req.body.secret) {
        return next();
    }

    const service = await getServiceBySecret(String(req.body.secret));
    if (!service)
        return next();

    const tempToken = await getToken("oauth-temp-code", String(req.body.code));
    if (tempToken.err || !tempToken.token)
        return next();

    const sessionToken = await getToken("oauth-session-token", tempToken.token.value);
    if (sessionToken.err || !sessionToken.token)
        return next();

    await tempToken.token.destroy();

    if (!sessionToken.token.value.startsWith(service.serviceID + "::"))
        return next();

    res.setHeader('Content-Type', 'application/json');

    return res.send(JSON.stringify({
        session_token: sessionToken.token.token
    }))

    
})

router.use("/user/logout/:sessiontoken/:serviceid", async (req: any, res: any, next: any) => {

    const redirectTo = await handleLogout(String(req.params.sessiontoken), String(req.params.serviceid))
    
    res.redirect(redirectTo);

})

router.use("/user/logout/:sessiontoken", async (req: any, res: any, next: any) => {

    const redirectTo = await handleLogout(String(req.params.sessiontoken))
    
    res.redirect(redirectTo);

})

export default router;