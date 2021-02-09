const router = require('express').Router();

import { getServiceByServiceId } from "../database/services/service";
import { disableSessionByToken } from "../database/services/session";
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

router.use("/user/logout/:sessiontoken/:serviceid", async (req: any, res: any, next: any) => {

    const redirectTo = await handleLogout(String(req.params.sessiontoken), String(req.params.serviceid))
    
    res.redirect(redirectTo);

})

router.use("/user/logout/:sessiontoken", async (req: any, res: any, next: any) => {

    const redirectTo = await handleLogout(String(req.params.sessiontoken))
    
    res.redirect(redirectTo);

})

export default router;