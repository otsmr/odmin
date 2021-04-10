const router = require('express').Router();

import log from "../utils/logs"
import { getServiceBySecret, getServiceByServiceId } from "../database/services/service";
import { disableSessionByToken, getSessionByToken } from "../database/services/session";
import { destroyExpiredTokens, destroyTokensByValue, getToken } from "../database/services/token";
import { checkIsTokanValid, getBuildedContinueForService, getUserByID } from "../database/services/user";
import config from "../utils/config";

router.get("/cron", async (req: any, res: any, next: any) => {
    res.setHeader('Content-Type', 'application/json');

    let sucess = true;

    let start = +new Date();

    if (!await destroyExpiredTokens()){
        sucess = false;
    }

    let timeStopped = +new Date() - start;

    
    if (!sucess) {
        res.status(500);
        log.error("cron", `Fehler beim Cronjob.`);
        return res.send(JSON.stringify({
            error: true
        }))
    }

    log.info("cron", `Cronjob nach ${timeStopped} ms erfolgreich beendet.`);
    
    return res.send(JSON.stringify({
        error: false,
        timeInMS: timeStopped
    }))

})

router.use("/set-cookie", async (req, res, next) => {

    res.header('Content-Type', 'application/json');
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Origin", config.get("frontend-base-url"));
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    let db = await getToken("odmin-set-cookie", String(req.body.setCookieToken));

    if (!db.err && db.token) {

        res.cookie('token', db.token.value, { httpOnly: true });

        try {
            await db.token.destroy();
        } catch (error) {
            // console.log(error);
        }
    }

    res.send(JSON.stringify({status: "ok"}));

});

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

router.get("/service/user/sigin", async (req: any, res: any, next: any) => {

    if (!req.query.serviceid || !req.query.continue)
        return next();
    
    if (req.cookies && req.cookies.token) {
        const session = await checkIsTokanValid(req.cookies.token);

        if (session) {
            let continueUrl = await getBuildedContinueForService(req.query.serviceid, session.session, req.query.continue);
            
            res.redirect(continueUrl);
            return;
        }

    }
    
    res.redirect(`${config.get("frontend-base-url")}/signin?serviceid=${req.query.serviceid}&continue=${req.query.continue}`);

})



async function handleLogout (sessiontoken: string, serviceid: string | null = null): Promise<string> {

    let redirectTo = config.get("frontend-base-url");
    let sucess = false;
    let token = null;

    let service = (serviceid) ? await getServiceByServiceId(serviceid) : null;

    if (service) {

        redirectTo = service.returnto;
        
        let sessionToken = await getToken("oauth-session-token", String(sessiontoken));
        
        if (!sessionToken.err &&
            sessionToken.token &&
            sessionToken.token.value.startsWith(service.serviceID + "::")
        ) {

            token = sessionToken.token.value.split("::")[1];
            await destroyTokensByValue(sessionToken.token.value);

        }

    } else {
        token = sessiontoken;
    }

    if (token !== null) {
        sucess = await disableSessionByToken(token);
    }
    
    return redirectTo + "?logout=" + ((sucess) ? 1 : 0);

}

router.get("/user/logout/:sessiontoken/:serviceid", async (req: any, res: any, next: any) => {

    const redirectTo = await handleLogout(String(req.params.sessiontoken), String(req.params.serviceid))
    
    res.redirect(redirectTo);

})

router.get("/user/logout/:sessiontoken", async (req: any, res: any, next: any) => {

    const redirectTo = await handleLogout(String(req.params.sessiontoken))
    
    res.redirect(redirectTo);

})

router.get("/user/logout", async (req: any, res: any, next: any) => {

    const redirectTo = await handleLogout(String(req.cookies.token) || "")
        
    res.redirect(redirectTo);

})

export default router;